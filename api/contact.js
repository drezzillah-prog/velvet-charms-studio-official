function formspreeUrl() {
  const endpoint = String(process.env.FORMSPREE_ENDPOINT || "").trim();
  if (/^https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+$/.test(endpoint)) return endpoint;
  const formId = String(process.env.FORMSPREE_FORM_ID || "").trim();
  return /^[A-Za-z0-9_-]+$/.test(formId) ? `https://formspree.io/f/${formId}` : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const name = String(req.body?.name || "").trim().slice(0, 120);
  const email = String(req.body?.email || "").trim().slice(0, 254);
  const message = String(req.body?.message || "").trim().slice(0, 5000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please provide a valid name, email and message." });
  const endpoint = formspreeUrl();
  if (!endpoint) return res.status(503).json({ error: "The contact form is not configured yet." });
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, _subject: "Velvet Charms Studio website message" })
    });
    if (!response.ok) return res.status(502).json({ error: "Your message could not be sent right now." });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Studio contact error", error);
    return res.status(500).json({ error: "Your message could not be sent right now." });
  }
}
