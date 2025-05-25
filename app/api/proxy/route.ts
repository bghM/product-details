// app/api/proxy/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const targetUrl = req.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "manual", // prevents infinite redirect loops
    });

    // Handle manual redirect (AliExpress often uses 302 chains)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        console.warn("Redirected to:", location);
        return NextResponse.redirect(location);
      }
    }

    const html = await response.text();
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Proxy error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}