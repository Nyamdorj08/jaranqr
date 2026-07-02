"use client";

import { updateOrderStatus } from "@/lib/actions/orders";
import type { OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Хүлээгдэж буй",
  completed: "Дууссан",
  cancelled: "Цуцалсан",
};

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  return (
    <form
      action={updateOrderStatus}
      onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}
    >
      <input type="hidden" name="id" value={orderId} />
      <select
        name="status"
        defaultValue={status}
        className="rounded-lg border border-neutral-300 px-2 py-1 text-xs"
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
