// Arabic output + image download

import Image from "next/image";

export default function ProductResult({ data }: { data: any }) {
  function downloadImage(url: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = "product-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4 mt-6">
      <div>
        <h2 className="text-xl font-bold">اسم المنتج</h2>
        <p>{data["اسم المنتج"]}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">الوصف القصير</h2>
        <p>{data["الوصف القصير"]}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">سعر التكلفة</h2>
        <p>{data.price} ر.س</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">سعر البيع المقترح</h2>
        <p>{data["سعر البيع"]} ر.س</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">الصور</h2>
        <div className="overflow-x-auto flex gap-4 py-2">
          {data.images?.map((img: string, idx: number) => (
            <div key={idx} className="relative w-32 h-32">
              <Image src={img} alt={data.alt || "صورة المنتج"} fill className="object-cover rounded" />
              <button
                onClick={() => downloadImage(img)}
                className="absolute bottom-1 left-1 text-xs bg-white px-2 py-1 rounded shadow"
              >
                تحميل
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold">الوزن المقدر</h2>
        <p>{data["الوزن المقدر"]}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">الطول</h2>
        <p>{data["الطول"]}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">دعوة للشراء</h2>
        <p>{data["CTA"]}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">تسمية انستقرام / تيك توك</h2>
        <p>{data.caption}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">الهاشتاقات</h2>
        <p>{data["الهاشتاقات"]?.join(" ")}</p>
      </div>
    </div>
  );
}
