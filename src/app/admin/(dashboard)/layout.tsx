import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { restaurant } from "@/lib/restaurant";

const NAV_ITEMS = [
  { href: "/admin", label: "Хянах самбар" },
  { href: "/admin/menu", label: "Меню" },
  { href: "/admin/orders", label: "Захиалгууд" },
  { href: "/admin/reports", label: "Тайлан" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-50 md:flex">
      <aside className="border-b border-neutral-200 bg-white md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-4 py-4">
          <p className="font-semibold text-brand-secondary">{restaurant.name}</p>
          <p className="text-xs text-neutral-600">Админ самбар</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:px-3 md:pb-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 md:shrink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-neutral-200 px-4 py-3 md:mt-auto">
          <p className="truncate text-xs text-neutral-600">{user?.email}</p>
          <form action={logout}>
            <button type="submit" className="mt-1 text-sm font-medium text-brand-primary">
              Гарах
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
