import type { NextApiRequest, NextApiResponse } from "next";
import cheerio from "cheerio";
import { translateAndGenerateArabicOutput } from "../../utils/translate";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { url } = req.body;
  if (!url || !url.includes("aliexpress.com/item")) {
    return res.status(400).json({ message: "Invalid AliExpress URL" });
  }

  try {
    const proxyUrl = process.env.PROXY_API_URL;
    const proxyRes = await fetch(`${proxyUrl}?url=${encodeURIComponent(url)}`);
    const html = await proxyRes.text();
    const $ = cheerio.load(html);

    const title = $("title").text().trim();
    const priceText = $('meta[property="og:price:amount"]').attr("content") || "";
    const images = $("img")
      .map((_, el) => $(el).attr("src"))
      .get()
      .filter((src) => src && src.includes("ae01.alicdn.com"));

    const descriptionTexts = [];
    $("div, span, li, p").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 50 && !descriptionTexts.includes(text)) {
        descriptionTexts.push(text);
      }
    });

    const base = {
      title,
      price: priceText,
      images: [...new Set(images)].slice(0, 8),
      description: descriptionTexts.slice(0, 10).join(" "),
    };

    const translated = await translateAndGenerateArabicOutput(base);

    res.status(200).json({
      ...base,
      ...translated,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product data" });
  }
}
