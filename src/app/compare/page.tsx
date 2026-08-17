import type { Metadata } from "next";
import { getProductsLight } from "@/lib/data";
import CompareView from "@/components/CompareView";

export const metadata: Metadata = { title: "Сравнение товаров" };

export default function ComparePage() {
  const products = getProductsLight();
  return (
    <div className="container-max py-10">
      <h1 className="mb-8 text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Сравнение товаров
      </h1>
      <CompareView products={products} />
    </div>
  );
}
