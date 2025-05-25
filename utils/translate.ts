import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function translateAndGenerateArabicOutput(base: {
  title: string;
  price: string;
  description: string;
  images: string[];
}) {
  const prompt = `Extracted data from AliExpress:
Product title: ${base.title}
Price: ${base.price}
Description: ${base.description}

Your task:
1. Translate to Arabic and improve the title to be SEO-friendly
2. Write a short SEO-friendly Arabic product description
3. Write short Arabic alt text (no punctuation, max 70 chars)
4. Estimate weight in grams if possible from product type or mention "—"
5. Estimate product height if found, else write "—"
6. Write an actionable Arabic CTA
7. Write a catchy Arabic caption for Instagram/TikTok
8. Suggest a competitive selling price (20-50% markup)
9. Generate 5 Arabic SEO hashtags

Return result in this JSON format:

{
  "اسم المنتج": "",
  "الوصف القصير": "",
  "alt": "",
  "الوزن المقدر": "",
  "الطول": "",
  "CTA": "",
  "caption": "",
  "سعر البيع": "",
  "الهاشتاقات": [""]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const jsonText = completion.choices[0].message.content?.trim();
  return JSON.parse(jsonText || "{}");
}
