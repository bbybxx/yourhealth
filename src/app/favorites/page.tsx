import type { Metadata } from "next";
import { getProductsLight } from "@/lib/data";
import FavoritesView from "@/components/FavoritesView";

export const metadata: Metadata = { title: "Избранное" };

export default function FavoritesPage() {
  const products = getProductsLight();
  return (
    <div className="container-max py-10">
      <h1 className="mb-8 text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Избранное
      </h1>
      <FavoritesView products={products} />
    </div>
  );
}
