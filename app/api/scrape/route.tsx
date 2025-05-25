// import { NextRequest, NextResponse } from "next/server";
// import * as cheerio from "cheerio";
// import { translateAndGenerateArabicOutput } from "@/utils/translate";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { url } = body;

//   if (!url || !url.includes("aliexpress.com")) { 
//     return NextResponse.json({ message: "Invalid AliExpress URL" }, { status: 400 });
//   }

//   try {
//     const proxyUrl = process.env.PROXY_API_URL;
//     const proxyFetchUrl = `${proxyUrl}${encodeURIComponent(url)}`;

//     const response = await fetch(proxyFetchUrl, {
//       headers: {
//         "User-Agent": "Mozilla/5.0", // Pretend to be a browser
//       },
//       redirect: "follow",
//     });

//     const finalUrl = response.url;
//     console.log("Final redirected URL:", finalUrl);


//     console.log("response:", response);
//     console.log("TITLE:", $("title").text());
//     console.log("IMAGE COUNT:", $("img").length);
//     console.log("PRICE:", $('meta[property="og:price:amount"]').attr("content"));


//     if (!response.ok) {
//       console.error("Proxy fetch failed:", response.status, await response.text());
//       return NextResponse.json({ message: "Proxy failed", status: response.status }, { status: 500 });
//     }

//     const html = await response.text();
//     const $ = cheerio.load(html);

//     const title = $("title").text().trim();
//     const price = $('meta[property="og:price:amount"]').attr("content") || "";

//     console.log("TITLE:", $("title").text());
//     console.log("IMAGE COUNT:", $("img").length);
//     console.log("PRICE:", $('meta[property="og:price:amount"]').attr("content"));


//     const images = $("img")
//       .map((_, el) => $(el).attr("src"))
//       .get()
//       .filter((src) => src && src.includes("ae01.alicdn.com"))
//       .slice(0, 8);

//     const descriptionSnippets: string[] = [];
//     $("div, span, li, p").each((_, el) => {
//       const text = $(el).text().trim();
//       if (text.length > 50 && !descriptionSnippets.includes(text)) {
//         descriptionSnippets.push(text);
//       }
//     });

//     const base = {
//       title,
//       price,
//       images,
//       description: descriptionSnippets.slice(0, 10).join(" "),
//     };

//     const translated = await translateAndGenerateArabicOutput(base);

//     return NextResponse.json({
//       ...base,
//       ...translated,
//     });
//   } 
//   catch (err: any) {
//     console.error("Error scraping or translating:", err.message);
//     return NextResponse.json({ message: "Failed to scrape AliExpress product", error: err.message }, { status: 500 });
//   }


// }


import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { translateAndGenerateArabicOutput } from "@/utils/translate";

// Utility to clean up any junk from redirected URLs
function cleanAliExpressUrl(dirtyUrl: string): string {
  try {
    const u = new URL(dirtyUrl);
    const match = u.pathname.match(/\/item\/\d+\.html/);
    if (match) {
      return `https://www.aliexpress.com${match[0]}`;
    }
    return dirtyUrl;
  } catch {
    return dirtyUrl;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📦 Received body:", body);

    const url = body?.url;
    if (!url) {
      console.error("❌ Missing URL in body");
      return NextResponse.json({ error: "URL is missing" }, { status: 400 });
    }

    return NextResponse.json({
      message: "✅ URL received",
      url,
    });
  } catch (err: any) {
    console.error("❌ Error parsing JSON or responding:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     const bodyText = await req.text(); // read raw body as text
//     console.log("🧪 Raw body string:", bodyText);

//     const body = JSON.parse(bodyText);
//     const { url } = body;

//     if (!url) {
//       throw new Error("URL is missing");
//     }

//     console.log("✅ URL received:", url);

//     return NextResponse.json({
//       message: "URL received",
//       url,
//     });
//   } catch (err: any) {
//     console.error("❌ Error in scrape API:", err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }


// export async function POST(req: NextRequest) {
//   console.log("URL is: ", req)


//   const { url } = await req.json();
//   console.log("URL is: ", url)


//   if (!url || !url.includes("aliexpress.com")) {
//     return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
//   }

//   console.log("im here")

//   try {
//     const cleanUrl = url.split("?")[0]; // strip junk
//     const proxyUrl = `${process.env.PROXY_API_URL}${encodeURIComponent(cleanUrl)}`;

//     const response = await fetch(proxyUrl, {
//       headers: { "User-Agent": "Mozilla/5.0" },
//       redirect: "follow",
//     });

//     console.log(response)

//     const html = await response.text();
//     console.log(html)

//     return NextResponse.json({ message: "Fetched OK", htmlSnippet: html.slice(0, 300) });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }