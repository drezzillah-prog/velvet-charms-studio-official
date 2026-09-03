export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const paypalConfigured = Boolean(process.env.PAYPAL_CLIENT_ID && (process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET));
  const contactConfigured = Boolean(process.env.FORMSPREE_ENDPOINT || process.env.FORMSPREE_FORM_ID);
  const storeLive = String(process.env.STORE_LIVE || "").toLowerCase() === "true";
  return res.status(200).json({ storeLive, paypalConfigured, contactConfigured });
}
