"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function refreshMenuPaths() {
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

export async function createCategory(formData: FormData) {
  const supabase = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const sortOrder = Number(formData.get("sort_order") ?? 0);
  await supabase.from("categories").insert({ name, sort_order: sortOrder });
  refreshMenuPaths();
}

export async function deleteCategory(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("categories").delete().eq("id", id);
  refreshMenuPaths();
}

export async function createMenuItem(formData: FormData) {
  const supabase = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "");
  const price = Number(formData.get("price") ?? 0);
  if (!name || !categoryId || Number.isNaN(price)) return;

  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  await supabase.from("menu_items").insert({
    category_id: categoryId,
    name,
    description,
    price,
    image_url: imageUrl || null,
    tags,
    is_available: true,
  });
  refreshMenuPaths();
}

export type UpdateMenuItemState = { success: boolean } | undefined;

export async function updateMenuItem(
  _prevState: UpdateMenuItemState,
  formData: FormData,
): Promise<UpdateMenuItemState> {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false };

  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  await supabase
    .from("menu_items")
    .update({
      name,
      price,
      description,
      image_url: imageUrl || null,
      tags,
    })
    .eq("id", id);
  refreshMenuPaths();
  return { success: true };
}

export async function toggleMenuItemAvailability(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  const isAvailable = formData.get("is_available") === "true";
  if (!id) return;

  await supabase.from("menu_items").update({ is_available: !isAvailable }).eq("id", id);
  refreshMenuPaths();
}

export async function deleteMenuItem(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("menu_items").delete().eq("id", id);
  refreshMenuPaths();
}
