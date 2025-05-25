// /app/api/scrape/route.ts

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Clean AliExpress links
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
    if (!url)
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

    const cleanUrl = extractCleanUrl(url);
    const proxyUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }/api/proxy?url=${encodeURIComponent(cleanUrl)}`;

    console.log('🌐 Fetching via proxy:', proxyUrl);

    const htmlRes = await fetch(proxyUrl);
    const html = await htmlRes.text();
   

    const $ = cheerio.load(html);

    const title =
      $('h1, .product-title, .product-name').first().text().trim() ||
      $('title').text().trim();
 console.log("title :" ,title);

    const price =
      $('meta[property="og:price:amount"]').attr('content') ||
      $('[class*=price]').first().text().trim() ||
      '';
 console.log("price :",price);

    const images = $('img')
      .map((_, el) => $(el).attr('src'))
      .get()
      .filter((src) => src?.includes('ae01.alicdn.com'))
      .slice(0, 5);

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
