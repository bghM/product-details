// // /app/api/scrape/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import * as cheerio from 'cheerio';

// // Clean AliExpress links
// function extractCleanUrl(input: string): string {
//   try {
//     const u = new URL(input);
//     const match = u.pathname.match(/\/item\/\d+\.html/);
//     return match ? `https://www.aliexpress.com${match[0]}` : input;
//   } catch {
//     return input;
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { url } = await req.json();
//     if (!url)
//       return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

//     const cleanUrl = extractCleanUrl(url);
//     const proxyUrl = `${
//       process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
//     }/api/proxy?url=${encodeURIComponent(cleanUrl)}`;

//     console.log('🌐 Fetching via proxy:', proxyUrl);

//     const htmlRes = await fetch(proxyUrl);
//     const html = await htmlRes.text();

//     const $ = cheerio.load(html);

//     const title =
//       $('h1, .product-title, .product-name').first().text().trim() ||
//       $('title').text().trim();
//  console.log("title :" ,title);

//     const price =
//       $('meta[property="og:price:amount"]').attr('content') ||
//       $('[class*=price]').first().text().trim() ||
//       '';
//  console.log("price :",price);

//     const images = $('img')
//       .map((_, el) => $(el).attr('src'))
//       .get()
//       .filter((src) => src?.includes('ae01.alicdn.com'))
//       .slice(0, 5);

//     return NextResponse.json({
//       message: '✅ Scraped successfully',
//       title,
//       price,
//       images,
//     });
//   } catch (err: any) {
//     console.error('❌ Scraping error:', err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import * as cheerio from 'cheerio';

// // Clean AliExpress product URL
// function extractCleanUrl(input: string): string {
//   try {
//     const u = new URL(input);
//     const match = u.pathname.match(/\/item\/\d+\.html/);
//     return match ? `https://www.aliexpress.com${match[0]}` : input;
//   } catch {
//     return input;
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { url } = await req.json();
//     if (!url) {
//       return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
//     }

//     const cleanUrl = extractCleanUrl(url);
//     const proxyUrl = `${
//       process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
//     }/api/proxy?url=${encodeURIComponent(cleanUrl)}`;

//     console.log('🌐 Fetching via proxy:', proxyUrl);
//     const htmlRes = await fetch(proxyUrl);
//     const html = await htmlRes.text();

//     const $ = cheerio.load(html);

//     // Robust title extraction
//     let title =
//       $('h1[data-pl="product-title"]').first().text().trim() ||
//       $('.product-title').first().text().trim() ||
//       $('meta[property="og:title"]').attr('content')?.trim() ||
//       $('meta[name="twitter:title"]').attr('content')?.trim() ||
//       $('h1[class*="title" i]').first().text().trim() ||
//       $('h2[class*="title" i]').first().text().trim() ||
//       $('title').text().split('|')[0].trim();

//     // Fallback to clean the title
//     if (title?.toLowerCase().includes('aliexpress')) {
//       title = title.split('|')[0].trim();
//     }

//     console.log('📦 Title:', title);

//     // Robust price extraction
//     let price = '';

//     $('[class*=price]').each((_i, el) => {
//       const text = $(el).text().trim();
//       console.log('🔍 price candidate:', text);
//     });
//     // $('.price--currentPriceText--V8_y_b5').first().text().trim() ||
//     // $('.pdp-comp-price-current').first().text().trim() ||
//     // $('.product-price-value').first().text().trim() ||
//     // $('.currentPriceText').first().text().trim() ||
//     // $('meta[property="og:price:amount"]').attr('content') ||
//     // '';

//     // fallback regex-based scan
//     if (!price) {
//       $('[class*="price" i], [id*="price" i]').each((_i, el) => {
//         const text = $(el).text().trim();
//         const match = text.match(/(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,2})?)/);
//         if (match && !price) {
//           price = match[0].replace(/\s+/g, ' ');
//         }
//       });
//     }
//     console.warn('⚠️ Price not found using specified classes.');

//     console.log('💰 Price:', price);

//     // Image scraping
//     let images: string[] = $('img')
//       .map((_, el) => $(el).attr('src'))
//       .get()
//       .filter(
//         (src) => src?.includes('ae01.alicdn.com') && src.startsWith('http')
//       )
//       .slice(0, 5);

//     if (images.length === 0) {
//       const ogImage = $('meta[property="og:image"]').attr('content');
//       if (ogImage) images.push(ogImage);
//     }

//     console.log('🖼️ Images:', images);

//     if (!title || !price) {
//       return NextResponse.json(
//         {
//           error:
//             'Could not extract product title or price. AliExpress layout may have changed.',
//         },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({
//       message: '✅ Scraped successfully',
//       title,
//       price,
//       images,
//     });
//   } catch (err: any) {
//     console.error('❌ Scraping error:', err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

// Clean AliExpress product URL
function extractCleanUrl(input: string): string {
  try {
    const u = new URL(input);
    const match = u.pathname.match(/\/item\/\d+\.html/);
    return match ? `https://www.aliexpress.com${match[0]}` : input;
  } catch {
    return input;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    const cleanUrl = extractCleanUrl(url);
    const proxyUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }/api/proxy?url=${encodeURIComponent(cleanUrl)}`;

    console.log('🌐 Fetching via proxy:', proxyUrl);
    const htmlRes = await fetch(proxyUrl);
    const html = await htmlRes.text();
    const $ = cheerio.load(html);

    // -------------------- Title Extraction --------------------
    let title =
      $('h1[data-pl="product-title"]').first().text().trim() ||
      $('.product-title').first().text().trim() ||
      $('meta[property="og:title"]').attr('content')?.trim() ||
      $('meta[name="twitter:title"]').attr('content')?.trim() ||
      $('h1[class*="title" i]').first().text().trim() ||
      $('h2[class*="title" i]').first().text().trim() ||
      $('title').text().split('|')[0].trim();

    if (title?.toLowerCase().includes('aliexpress')) {
      title = title.split('|')[0].trim();
    }

    console.log('📦 Title:', title);

    // -------------------- Price Extraction via Puppeteer --------------------
    console.log('🧠 Launching Puppeteer to extract price...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );
    await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 0 });

    const price = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('span')).find((el) =>
        el.textContent?.includes('ر.س.')
      );
      return el?.textContent?.trim() || '';
    });

    await browser.close();
    console.log('💰 Price from Puppeteer:', price);

    // -------------------- Image Extraction --------------------
    let images: string[] = $('img')
      .map((_, el) => $(el).attr('src'))
      .get()
      .filter(
        (src) => src?.includes('ae01.alicdn.com') && src.startsWith('http')
      )
      .slice(0, 5);

    if (images.length === 0) {
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) images.push(ogImage);
    }

    console.log('🖼️ Images:', images);

    if (!title || !price) {
      return NextResponse.json(
        {
          error:
            'Could not extract product title or price. AliExpress layout may have changed.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '✅ Scraped successfully',
      title,
      price,
      images,
    });
  } catch (err: any) {
    console.error('❌ Scraping error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
