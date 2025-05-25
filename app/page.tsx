// Frontend with auto-paste and loader

"use client";

import { useState, useEffect } from "react";
import ProductResult from "../components/ProductResult";

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const pastedText = event.clipboardData?.getData("text");
      if (pastedText?.includes("aliexpress.com/item")) {
        setUrl(pastedText);
        fetchProduct(pastedText);
      }
    };
    window.addEventListener("paste", handlePaste as any);
    return () => window.removeEventListener("paste", handlePaste as any);
  }, []);

  async function fetchProduct(link: string) {
    if (!link) return;

    console.log("Sending to scrape:", link);

    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://ar.aliexpress.com/item/1005005470146493.html?srcSns=sns_Copy&spreadType=socialShare&bizType=ProductDetail&social_params=6000292636686&aff_fcid=dd074b9adf6441b9ab422a0499855224-1748191250509-07756-_okRd1cA&tt=MG&aff_fsk=_okRd1cA&aff_platform=default&sk=_okRd1cA&aff_trace_key=dd074b9adf6441b9ab422a0499855224-1748191250509-07756-_okRd1cA&shareId=6000292636686&businessType=ProductDetail&platform=AE&terminal_id=8d244faef3354db89cb91b073abc5b45&afSmartRedirect=y" }),
      });
      const result = await res.json();
      if (res.ok) setData(result);
      else throw new Error(result.message || "حدث خطأ أثناء جلب البيانات");
    } catch (err: any) {
      setError(err.message);
      console.log("Error here")
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AliExpress Product Extractor</h1>
      <p className="text-sm mb-4">Paste or enter a product URL to extract product details in Arabic</p>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter AliExpress product URL"
          className="w-full border border-gray-300 p-2 rounded"
        />
        <button
          onClick={() => fetchProduct(url)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Fetch
        </button>
      </div>

      {loading && <p className="text-blue-500">جاري التحميل...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {data && <ProductResult data={data} />}
    </main>
  );
}
