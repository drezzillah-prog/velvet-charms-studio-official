import { createHash } from "node:crypto";
import { STUDIO_CURRENCY, validateCart } from "../lib/catalogue-source.js";

function paypalBaseUrl() {
  const mode = String(process.env.PAYPAL_ENV || process.env.PAYPAL_MODE || "live").toLowerCase();
  return mode === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
}
function paypalSecret() { return process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET; }
function formspreeUrl() {
  const endpoint = String(process.env.FORMSPREE_ENDPOINT || "").trim();
  if (/^https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+$/.test(endpoint)) return endpoint;
  const formId = String(process.env.FORMSPREE_FORM_ID || "").trim();
  return /^[A-Za-z0-9_-]+$/.test(formId) ? `https://formspree.io/f/${formId}` : "";
}

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
function parseStored(value) {
  const match = /^(RO|INTL):([a-f0-9]{40})$/.exec(String(value || ""));
  return match ? { market: match[1], fingerprint: match[2] } : null;
}
function shippingSummary(details) {
  const shipping = details.purchase_units?.[0]?.shipping;
  const address = shipping?.address || {};
  return [shipping?.name?.full_name, address.address_line_1, address.address_line_2, address.admin_area_2, address.admin_area_1, address.postal_code, address.country_code].filter(Boolean).join(", ") || "See PayPal order";
}
async function notifySeller(details, items, orderID, captureID, market, total, date) {
  const endpoint = formspreeUrl();
  if (!endpoint) return false;
  const payerName = [details.payer?.name?.given_name, details.payer?.name?.surname].filter(Boolean).join(" ") || "Not provided";
  const payerEmail = details.payer?.email_address || "Not provided";
  const itemLines = items.flatMap((item, index) => {
    const lines = [`${index + 1}. ${item.name} × ${item.quantity} — EUR ${(item.price * item.quantity).toFixed(2)}`];
    Object.entries(item.options || {}).forEach(([key, value]) => lines.push(`   ${key.replaceAll("_", " ")}: ${value}`));
    return lines;
  });
  const message = [
    "PAID VELVET CHARMS STUDIO ORDER",
    `PayPal order: ${orderID}`,
    `PayPal capture: ${captureID}`,
    `Pricing market: ${market}`,
    `Paid product total: EUR ${total.toFixed(2)}`,
    `Preferred date: ${date || "Not requested"} (not guaranteed until confirmed)`,
    `Customer: ${payerName}`,
    `Customer email: ${payerEmail}`,
    `Shipping address: ${shippingSummary(details)}`,
    "Shipping is confirmed separately if additional shipping payment is required.",
    "",
    "ITEMS",
    ...itemLines
  ].join("\n");
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name: payerName, email: payerEmail === "Not provided" ? "" : payerEmail, message, paypal_order_id: orderID, paypal_capture_id: captureID, _subject: `PAID Velvet Charms Studio order — ${orderID}` })
    });
    return response.ok;
  } catch (error) {
    console.error("Studio seller handoff error", error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const orderID = String(req.body?.orderID || "");
  if (!/^[A-Z0-9]{1,36}$/i.test(orderID)) return res.status(400).json({ error: "Missing or invalid PayPal order ID." });

  try {
    const baseUrl = paypalBaseUrl();
    const token = await accessToken(baseUrl);
    const detailsResponse = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderID)}`, { headers: { Authorization: `Bearer ${token}` } });
    const details = await detailsResponse.json();
    if (!detailsResponse.ok) return res.status(502).json({ error: "PayPal order details could not be verified." });

    const stored = parseStored(details.purchase_units?.[0]?.custom_id);
    if (!stored) return res.status(409).json({ error: "The approved PayPal order has invalid checkout metadata." });
    const items = await validateCart(req.body?.cart, stored.market);
    const date = requestedDate(req.body?.cart);
    if (fingerprint(items, date) !== stored.fingerprint) return res.status(409).json({ error: "The approved PayPal order no longer matches this cart." });

    const expectedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const paypalItems = details.purchase_units?.[0]?.items || [];
    const itemsMatch = paypalItems.length === items.length && items.every((item, index) => {
      const remote = paypalItems[index];
      return remote?.sku === item.key && Number(remote?.quantity) === item.quantity && remote?.unit_amount?.currency_code === STUDIO_CURRENCY && Number(remote?.unit_amount?.value) === Number(item.price.toFixed(2));
    });
    const amount = details.purchase_units?.[0]?.amount;
    const amountMatches = amount?.currency_code === STUDIO_CURRENCY && Number(amount?.value) === Number(expectedTotal.toFixed(2));
    if (!itemsMatch || !amountMatches) return res.status(409).json({ error: "The approved PayPal order no longer matches this cart." });

    const existingCapture = details.purchase_units?.[0]?.payments?.captures?.[0];
    if (details.status === "COMPLETED") {
      if (!existingCapture?.id || existingCapture.amount?.currency_code !== STUDIO_CURRENCY || Number(existingCapture.amount?.value) !== Number(expectedTotal.toFixed(2))) return res.status(409).json({ error: "Completed payment amount does not match the expected total." });
      const sellerNotificationSent = await notifySeller(details, items, details.id || orderID, existingCapture.id, stored.market, expectedTotal, date);
      return res.status(200).json({ status: "COMPLETED", orderID: details.id || orderID, captureID: existingCapture.id, sellerNotificationSent, recovered: true });
    }

    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" }
    });
    const capture = await captureResponse.json();
    if (!captureResponse.ok) return res.status(502).json({ error: "PayPal could not confirm the payment." });
    const payment = capture.purchase_units?.[0]?.payments?.captures?.[0];
    if (capture.status !== "COMPLETED" || !payment?.id || payment.amount?.currency_code !== STUDIO_CURRENCY || Number(payment.amount?.value) !== Number(expectedTotal.toFixed(2))) return res.status(502).json({ error: "PayPal payment was not completed correctly." });

    const sellerNotificationSent = await notifySeller(details, items, capture.id || orderID, payment.id, stored.market, expectedTotal, date);
    return res.status(200).json({ status: "COMPLETED", orderID: capture.id || orderID, captureID: payment.id, sellerNotificationSent, recovered: false });
  } catch (error) {
    console.error("Studio capture order error", error);
    if (["INVALID_CART", "INVALID_PRICE", "INVALID_CUSTOMIZATION"].includes(error.message)) return res.status(400).json({ error: "The cart or customization details are invalid." });
    if (error.message === "PAYPAL_NOT_CONFIGURED") return res.status(503).json({ error: "PayPal is not configured yet." });
    return res.status(500).json({ error: "Payment could not be confirmed." });
  }
}
