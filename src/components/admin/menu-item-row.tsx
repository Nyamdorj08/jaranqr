"use client";

import { useActionState, useEffect, useState } from "react";
import type { MenuItem } from "@/lib/types";
import {
  deleteMenuItem,
  toggleMenuItemAvailability,
  updateMenuItem,
} from "@/lib/actions/menu";

export function MenuItemRow({ item }: { item: MenuItem }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateMenuItem, undefined);

  useEffect(() => {
    if (state?.success) setEditing(false);
  }, [state]);

  if (editing) {
    return (
      <form action={formAction} className="space-y-2 rounded-xl border border-neutral-200 p-3">
        <input type="hidden" name="id" value={item.id} />
        <div className="grid grid-cols-2 gap-2">
          <input
            name="name"
            defaultValue={item.name}
            placeholder="Нэр"
            className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900"
          />
          <input
            name="price"
            type="number"
            step="1"
            defaultValue={item.price}
            placeholder="Үнэ"
            className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900"
          />
        </div>
        <textarea
          name="description"
          defaultValue={item.description}
          placeholder="Тайлбар"
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900"
        />
        <input
          name="image_url"
          defaultValue={item.image_url ?? ""}
          placeholder="Зургийн URL"
          className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900"
        />
        <input
          name="tags"
          defaultValue={item.tags.join(", ")}
          placeholder="Шошго (жишээ: new, popular)"
          className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
          >
            {pending ? "Хадгалж байна..." : "Хадгалах"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium"
          >
            Болих
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
          {!item.is_available && (
            <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
              Идэвхгүй
            </span>
          )}
        </div>
        <p className="truncate text-xs text-gray-700">{item.description}</p>
        <p className="text-xs font-semibold text-gray-900">{item.price.toLocaleString()}₮</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium"
        >
          Засах
        </button>
        <form action={toggleMenuItemAvailability}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="is_available" value={String(item.is_available)} />
          <button className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium">
            {item.is_available ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
          </button>
        </form>
        <form action={deleteMenuItem}>
          <input type="hidden" name="id" value={item.id} />
          <button className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600">
            Устгах
          </button>
        </form>
      </div>
    </div>
  );
}
