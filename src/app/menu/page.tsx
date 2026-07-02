import type { Metadata } from "next";
import { getMenu } from "@/lib/data";
import { restaurant } from "@/lib/restaurant";
import { MenuBrowser } from "@/components/menu/menu-browser";

export const metadata: Metadata = {
  title: `${restaurant.name} — Цэс`,
};

export default async function MenuPage() {
  const categories = await getMenu({ onlyAvailable: true });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-neutral-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={restaurant.logo} alt={restaurant.name} className="h-10 w-10 rounded-full object-cover" />
        <h1 className="text-lg font-semibold text-brand-secondary">{restaurant.name}</h1>
      </header>
      <MenuBrowser categories={categories} />
    </div>
  );
}
