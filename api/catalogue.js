import { publicCatalogue, marketFromRequest } from "../lib/catalogue-source.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const payload = await publicCatalogue();
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
    return res.status(200).json({ ...payload, market: marketFromRequest(req) });
  } catch (error) {
    console.error("Studio catalogue API error", error);
    return res.status(503).json({ error: "The Studio catalogue is temporarily unavailable." });
  }
}
