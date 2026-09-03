import { createHash } from "node:crypto";
import { STUDIO_CURRENCY, marketFromRequest, validateCart } from "../lib/catalogue-source.js";

function storeIsLive() { return String(process.env.STORE_LIVE || "").toLowerCase() === "true"; }
function paypalBaseUrl() {
  const mode = String(process.env.PAYPAL_ENV || process.env.PAYPAL_MODE || "live").toLowerCase();
  return mode === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
}
function paypalSecret() { return process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET; }

async function accessToken(baseUrl) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = paypalSecret();
  if (!clientId || !secret) throw new Error("PAYPAL_NOT_CONFIGURED");
  const authorization = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("PAYPAL_AUTH_FAILED");
  return data.access_token;
}

function requestedDate(cart) {
  const value = String(cart?.requiredByDate || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function fingerprint(items, date) {
  const normalized = items.map(item => ({
    key: item.key,
    quantity: item.quantity,
    options: Object.fromEntries(Object.entries(item.options || {}).sort(([a],[b]) => a.localeCompare(b)))
  }));
  return createHash("sha256").update(JSON.stringify({ items: normalized, date })).digest("hex").slice(0, 40);
}

function description(item, date, index) {
  const bits = Object.entries(item.options || {}).map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`);
  if (index === 0 && date) bits.unshift(`Preferred date: ${date} (not guaranteed)`);
  return bits.join("; ").slice(0, 127);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!storeIsLive()) return res.status(503).json({ error: "The Studio checkout is not live yet." });
  try {
    const market = marketFromRequest(req);
    const items = await validateCart(req.body?.cart, market);
    const date = requestedDate(req.body?.cart);
    const cartHash = fingerprint(items, date);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const baseUrl = paypalBaseUrl();
    const token = await accessToken(baseUrl);
    const protocol = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
    const host = String(req.headers.host || "");
    if (!host) throw new Error("HOST_MISSING");
    const siteUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          custom_id: `${market}:${cartHash}`,
          amount: {
            currency_code: STUDIO_CURRENCY,
            value: total.toFixed(2),
            breakdown: { item_total: { currency_code: STUDIO_CURRENCY, value: total.toFixed(2) } }
          },
          items: items.map((item, index) => ({
            name: item.name,
            sku: item.key,
            quantity: String(item.quantity),
            unit_amount: { currency_code: STUDIO_CURRENCY, value: item.price.toFixed(2) },
            ...(description(item, date, index) ? { description: description(item, date, index) } : {})
          }))
        }],
        payment_source: {
          paypal: {
            experience_context: {
              user_action: "PAY_NOW",
              return_url: `${siteUrl}/catalogue.html?payment=success`,
              cancel_url: `${siteUrl}/catalogue.html?payment=cancelled`
            }
          }
        }
      })
    });

    const order = await response.json();
    if (!response.ok) {
      console.error("PayPal create error", response.status, order);
      return res.status(502).json({ error: "PayPal could not create the order." });
    }
    const approveUrl = order.links?.find(link => link.rel === "payer-action" || link.rel === "approve")?.href;
    if (!order.id || !approveUrl) return res.status(502).json({ error: "PayPal approval link is unavailable." });
    return res.status(200).json({ orderID: order.id, approveUrl, market, currency: STUDIO_CURRENCY });
  } catch (error) {
    console.error("Studio create order error", error);
    if (["INVALID_CART", "INVALID_PRICE", "INVALID_CUSTOMIZATION"].includes(error.message)) return res.status(400).json({ error: "The cart or customization details are invalid." });
    if (error.message === "PAYPAL_NOT_CONFIGURED") return res.status(503).json({ error: "PayPal is not configured yet." });
    return res.status(500).json({ error: "Checkout could not be started." });
  }
}
