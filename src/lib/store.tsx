"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  id: number;
  qty: number;
}

interface StoreValue {
  cart: CartItem[];
  favorites: number[];
  compare: number[];
  addToCart: (id: number, qty?: number) => void;
  removeFromCart: (id: number) => void;
  setCartQty: (id: number, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSum: number;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  toggleCompare: (id: number) => void;
  isCompare: (id: number) => boolean;
  clearCompare: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [compare, setCompare] = useState<number[]>([]);

  // Гидрация из localStorage (выполняется один раз при монтировании на клиенте)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(readLS<CartItem[]>("yh-cart", []));
    setFavorites(readLS<number[]>("yh-favorites", []));
    setCompare(readLS<number[]>("yh-compare", []));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("yh-cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);
  useEffect(() => {
    try {
      window.localStorage.setItem("yh-favorites", JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);
  useEffect(() => {
    try {
      window.localStorage.setItem("yh-compare", JSON.stringify(compare));
    } catch {
      /* ignore */
    }
  }, [compare]);

  const addToCart = useCallback((id: number, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { id, qty }];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setCartQty = useCallback((id: number, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  const toggleCompare = useCallback((id: number) => {
    setCompare((prev) =>
      prev.includes(id)
        ? prev.filter((f) => f !== id)
        : prev.length >= 4
          ? prev
          : [...prev, id]
    );
  }, []);

  const clearCompare = useCallback(() => setCompare([]), []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);
  const isCompare = useCallback((id: number) => compare.includes(id), [compare]);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      favorites,
      compare,
      addToCart,
      removeFromCart,
      setCartQty,
      clearCart,
      cartCount,
      cartSum: 0,
      toggleFavorite,
      isFavorite,
      toggleCompare,
      isCompare,
      clearCompare,
    }),
    [
      cart,
      favorites,
      compare,
      addToCart,
      removeFromCart,
      setCartQty,
      clearCart,
      cartCount,
      toggleFavorite,
      isFavorite,
      toggleCompare,
      isCompare,
      clearCompare,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
