import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrders } from "@/lib/data";
import type { OrderStatus } from "@/lib/types";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status") as OrderStatus | null;

  const orders = await getOrders({
    start: from ? new Date(from) : undefined,
    end: to ? new Date(`${to}T23:59:59.999`) : undefined,
    status: status ?? undefined,
  });

  const header = ["Огноо", "Ширээ", "Төлөв", "Хоолнууд", "Нийт дүн"];
  const rows = orders.map((order) => [
    new Date(order.created_at).toLocaleString("mn-MN"),
    order.table_number ?? "",
    order.status,
    order.order_items
      .map((line) => `${line.menu_items?.name ?? "?"} x${line.quantity}`)
      .join("; "),
    String(order.total_amount),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
    .join("\n");

  return new NextResponse(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
    },
  });
}
