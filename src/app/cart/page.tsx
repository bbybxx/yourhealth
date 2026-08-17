import type { Metadata } from "next";
import { getProductsLight } from "@/lib/data";
import CartView from "@/components/CartView";

export const metadata: Metadata = { title: "Корзина" };

export default function CartPage() {
  const products = getProductsLight();
  return (
    <div className="container-max py-10">
      <h1 className="mb-8 text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Корзина
      </h1>
      <CartView products={products} />
    </div>
  );
}
