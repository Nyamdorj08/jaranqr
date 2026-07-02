"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export type CartInput = { menuItemId: string; quantity: number }[];

export type SubmitOrderResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

// Prices are re-read from the database rather than trusted from the client,
// so a tampered cart payload can't under-charge an order.
export async function submitOrder(
  cart: CartInput,
  tableNumber?: string,
): Promise<SubmitOrderResult> {
  if (!cart.length) {
    return { success: false, error: "Сагс хоосон байна." };
  }

  const supabase = await createClient();

  const ids = [...new Set(cart.map((line) => line.menuItemId))];
  const { data: items, error: itemsErr } = await supabase
    .from("menu_items")
    .select("id,price,is_available")
    .in("id", ids);

  if (itemsErr || !items) {
    return { success: false, error: "Хоолны мэдээлэл татахад алдаа гарлаа." };
  }

  const itemById = new Map(items.map((item) => [item.id, item]));
  let total = 0;
  const orderItemsPayload: {
    menu_item_id: string;
    quantity: number;
    price_at_order_time: number;
  }[] = [];

  for (const line of cart) {
    const item = itemById.get(line.menuItemId);
    if (!item || !item.is_available || line.quantity <= 0) continue;
    total += Number(item.price) * line.quantity;
    orderItemsPayload.push({
      menu_item_id: line.menuItemId,
      quantity: line.quantity,
      price_at_order_time: item.price,
    });
  }

  if (orderItemsPayload.length === 0) {
    return { success: false, error: "Сагсанд байгаа бараанууд боломжгүй байна." };
  }

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      table_number: tableNumber?.trim() || null,
      total_amount: total,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return { success: false, error: "Захиалга үүсгэхэд алдаа гарлаа." };
  }

  const { error: orderItemsErr } = await supabase
    .from("order_items")
    .insert(orderItemsPayload.map((line) => ({ ...line, order_id: order.id })));

  if (orderItemsErr) {
    return { success: false, error: "Захиалгын мөр үүсгэхэд алдаа гарлаа." };
  }

  return { success: true, orderId: order.id as string };
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!id || !["pending", "completed", "cancelled"].includes(status)) return;

  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
