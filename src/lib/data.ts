import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CategoryWithItems, MenuItem, OrderStatus } from "@/lib/types";

export async function getMenu(
  options: { onlyAvailable?: boolean } = {},
): Promise<CategoryWithItems[]> {
  const supabase = await createClient();

  const [{ data: categories, error: catErr }, { data: items, error: itemErr }] =
    await Promise.all([
      supabase.from("categories").select("id,name,sort_order").order("sort_order"),
      supabase
        .from("menu_items")
        .select(
          "id,category_id,name,description,price,image_url,is_available,tags,sort_order",
        )
        .order("sort_order"),
    ]);

  if (catErr) throw catErr;
  if (itemErr) throw itemErr;

  const allItems = (items ?? []) as MenuItem[];
  const filteredItems = options.onlyAvailable
    ? allItems.filter((item) => item.is_available)
    : allItems;

  return (categories ?? []).map((category) => ({
    ...category,
    items: filteredItems.filter((item) => item.category_id === category.id),
  }));
}

type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  quantity: number;
  price_at_order_time: number;
  menu_items: { name: string; categories: { name: string } | null } | null;
};

export type OrderRow = {
  id: string;
  table_number: string | null;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  order_items: OrderItemRow[];
};

export async function getOrdersInRange(
  start: Date,
  end: Date,
): Promise<OrderRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,table_number,status,total_amount,created_at,order_items(id,order_id,menu_item_id,quantity,price_at_order_time,menu_items(name,categories(name)))",
    )
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as OrderRow[];
}

export async function getOrders(filters: {
  start?: Date;
  end?: Date;
  status?: OrderStatus;
} = {}): Promise<OrderRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id,table_number,status,total_amount,created_at,order_items(id,order_id,menu_item_id,quantity,price_at_order_time,menu_items(name,categories(name)))",
    )
    .order("created_at", { ascending: false });

  if (filters.start) query = query.gte("created_at", filters.start.toISOString());
  if (filters.end) query = query.lt("created_at", filters.end.toISOString());
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as OrderRow[];
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function revenueOf(order: OrderRow) {
  return order.status === "cancelled" ? 0 : Number(order.total_amount);
}

export type DashboardMetrics = {
  todayRevenue: number;
  monthRevenue: number;
  lastMonthRevenue: number;
  growthPct: number | null;
  averageOrderValue: number;
  orderCount: number;
  trend: { date: string; revenue: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last30Start = new Date(todayStart);
  last30Start.setDate(last30Start.getDate() - 29);

  const orders = await getOrdersInRange(lastMonthStart, nextMonthStart);

  const monthOrders = orders.filter((o) => new Date(o.created_at) >= monthStart);
  const lastMonthOrders = orders.filter(
    (o) => new Date(o.created_at) < monthStart,
  );
  const todayOrders = orders.filter((o) => new Date(o.created_at) >= todayStart);
  const last30Orders = orders.filter(
    (o) => new Date(o.created_at) >= last30Start,
  );

  const monthRevenue = monthOrders.reduce((sum, o) => sum + revenueOf(o), 0);
  const lastMonthRevenue = lastMonthOrders.reduce(
    (sum, o) => sum + revenueOf(o),
    0,
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + revenueOf(o), 0);
  const activeMonthOrderCount = monthOrders.filter(
    (o) => o.status !== "cancelled",
  ).length;

  const growthPct =
    lastMonthRevenue === 0
      ? null
      : ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  const trendByDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(last30Start);
    d.setDate(d.getDate() + i);
    trendByDay.set(dayKey(d.toISOString()), 0);
  }
  for (const order of last30Orders) {
    const key = dayKey(order.created_at);
    if (trendByDay.has(key)) {
      trendByDay.set(key, (trendByDay.get(key) ?? 0) + revenueOf(order));
    }
  }
  const trend = Array.from(trendByDay.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  const topItemsMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of monthOrders) {
    if (order.status === "cancelled") continue;
    for (const line of order.order_items) {
      const name = line.menu_items?.name ?? "Устгагдсан хоол";
      const key = line.menu_item_id ?? name;
      const existing = topItemsMap.get(key) ?? { name, quantity: 0, revenue: 0 };
      existing.quantity += line.quantity;
      existing.revenue += line.quantity * Number(line.price_at_order_time);
      topItemsMap.set(key, existing);
    }
  }
  const topItems = Array.from(topItemsMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    todayRevenue,
    monthRevenue,
    lastMonthRevenue,
    growthPct,
    averageOrderValue:
      activeMonthOrderCount === 0 ? 0 : monthRevenue / activeMonthOrderCount,
    orderCount: activeMonthOrderCount,
    trend,
    topItems,
  };
}

export type MonthlyReport = {
  month: string;
  totalRevenue: number;
  orderCount: number;
  categoryBreakdown: { category: string; revenue: number; pct: number }[];
  bestSellers: { name: string; quantity: number; revenue: number }[];
};

export async function getMonthlyReport(monthStart: Date): Promise<MonthlyReport> {
  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    1,
  );
  const orders = await getOrdersInRange(monthStart, monthEnd);
  const activeOrders = orders.filter((o) => o.status !== "cancelled");

  const totalRevenue = activeOrders.reduce((sum, o) => sum + revenueOf(o), 0);

  const categoryMap = new Map<string, number>();
  const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  for (const order of activeOrders) {
    for (const line of order.order_items) {
      const lineRevenue = line.quantity * Number(line.price_at_order_time);
      const categoryName = line.menu_items?.categories?.name ?? "Бусад";
      categoryMap.set(categoryName, (categoryMap.get(categoryName) ?? 0) + lineRevenue);

      const name = line.menu_items?.name ?? "Устгагдсан хоол";
      const key = line.menu_item_id ?? name;
      const existing = itemMap.get(key) ?? { name, quantity: 0, revenue: 0 };
      existing.quantity += line.quantity;
      existing.revenue += lineRevenue;
      itemMap.set(key, existing);
    }
  }

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, revenue]) => ({
      category,
      revenue,
      pct: totalRevenue === 0 ? 0 : (revenue / totalRevenue) * 100,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const bestSellers = Array.from(itemMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
    totalRevenue,
    orderCount: activeOrders.length,
    categoryBreakdown,
    bestSellers,
  };
}
