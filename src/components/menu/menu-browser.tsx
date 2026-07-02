"use client";

import { useMemo, useState, useTransition } from "react";
import type { CategoryWithItems, MenuItem } from "@/lib/types";
import { submitOrder } from "@/lib/actions/orders";

const TAG_LABELS: Record<string, string> = {
  spicy: "Халуун",
  vegan: "Vegan",
  new: "Шинэ",
  popular: "Санал болгож буй",
};

type CartState = Record<string, { item: MenuItem; quantity: number }>;

export function MenuBrowser({ categories }: { categories: CategoryWithItems[] }) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartState>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [pending, startTransition] = useTransition();
  const [orderResult, setOrderResult] = useState<{ ok: boolean; message: string } | null>(null);

  const allItems = useMemo(() => categories.flatMap((c) => c.items), [categories]);

  const visibleItems = useMemo(() => {
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return allItems.filter((item) => item.name.toLowerCase().includes(q));
    }
    return categories.find((c) => c.id === activeCategoryId)?.items ?? [];
  }, [query, allItems, categories, activeCategoryId]);

  const cartLines = Object.values(cart);
  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
  const cartTotal = cartLines.reduce((sum, l) => sum + l.quantity * l.item.price, 0);

  function addToCart(item: MenuItem) {
    setCart((prev) => ({
      ...prev,
      [item.id]: { item, quantity: (prev[item.id]?.quantity ?? 0) + 1 },
    }));
  }

  function updateQuantity(itemId: string, delta: number) {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...existing, quantity: nextQty } };
    });
  }

  function handleSubmitOrder() {
    setOrderResult(null);
    startTransition(async () => {
      const result = await submitOrder(
        cartLines.map((l) => ({ menuItemId: l.item.id, quantity: l.quantity })),
        tableNumber,
      );
      if (result.success) {
        setOrderResult({ ok: true, message: "Захиалга амжилттай илгээгдлээ!" });
        setCart({});
      } else {
        setOrderResult({ ok: false, message: result.error });
      }
    });
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-4 py-3 border-b border-neutral-200">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Хоолны нэрээр хайх..."
          className="w-full rounded-full border border-neutral-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        {!query && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategoryId(c.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategoryId === c.id
                    ? "bg-brand-primary text-white"
                    : "bg-neutral-100 text-neutral-700"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-4 grid grid-cols-1 gap-3 pb-28">
        {visibleItems.length === 0 && (
          <p className="text-center text-neutral-600 py-10">Илэрц олдсонгүй.</p>
        )}
        {visibleItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            quantity={cart[item.id]?.quantity ?? 0}
            onAdd={() => addToCart(item)}
            onIncrement={() => updateQuantity(item.id, 1)}
            onDecrement={() => updateQuantity(item.id, -1)}
          />
        ))}
      </div>

      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-2xl bg-brand-primary px-5 py-3.5 text-white shadow-lg"
        >
          <span className="font-medium">{cartCount} бараа</span>
          <span className="font-semibold">{cartTotal.toLocaleString()}₮</span>
        </button>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end bg-black/40">
          <div className="rounded-t-3xl bg-white p-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-lg font-semibold">Таны сагс</h2>
              <button onClick={() => setCartOpen(false)} className="text-neutral-600 text-sm">
                Хаах
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
              {cartLines.length === 0 && (
                <p className="py-8 text-center text-neutral-600">Сагс хоосон байна</p>
              )}
              {cartLines.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-neutral-600">{item.price.toLocaleString()}₮</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-7 w-7 rounded-full border border-neutral-300 text-sm"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-7 w-7 rounded-full border border-neutral-300 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {cartLines.length > 0 && (
              <div className="pt-3 border-t border-neutral-200 space-y-3">
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Ширээний дугаар (заавал биш)"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
                <div className="flex items-center justify-between font-semibold">
                  <span>Нийт дүн</span>
                  <span>{cartTotal.toLocaleString()}₮</span>
                </div>
                {orderResult && (
                  <p className={`text-sm ${orderResult.ok ? "text-green-600" : "text-red-600"}`}>
                    {orderResult.message}
                  </p>
                )}
                <button
                  onClick={handleSubmitOrder}
                  disabled={pending}
                  className="w-full rounded-xl bg-brand-primary py-3 font-medium text-white disabled:opacity-60"
                >
                  {pending ? "Илгээж байна..." : "Захиалга илгээх"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-neutral-200 p-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="shrink-0 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary"
              >
                {TAG_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-neutral-600 line-clamp-2 mt-0.5">{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-sm">{item.price.toLocaleString()}₮</span>
          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="rounded-full bg-brand-primary px-3 py-1 text-xs font-medium text-white"
            >
              Нэмэх
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onDecrement}
                className="h-6 w-6 rounded-full border border-neutral-300 text-xs"
              >
                −
              </button>
              <span className="w-3 text-center text-xs">{quantity}</span>
              <button
                onClick={onIncrement}
                className="h-6 w-6 rounded-full border border-neutral-300 text-xs"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
