import { getOrders } from "@/lib/data";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import type { OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Хүлээгдэж буй",
  completed: "Дууссан",
  cancelled: "Цуцалсан",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}) {
  const params = await searchParams;
  const status =
    params.status && ["pending", "completed", "cancelled"].includes(params.status)
      ? (params.status as OrderStatus)
      : undefined;

  const orders = await getOrders({
    start: params.from ? new Date(params.from) : undefined,
    end: params.to ? new Date(`${params.to}T23:59:59.999`) : undefined,
    status,
  });

  const exportQuery = new URLSearchParams();
  if (params.from) exportQuery.set("from", params.from);
  if (params.to) exportQuery.set("to", params.to);
  if (status) exportQuery.set("status", status);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-brand-secondary">Захиалгууд</h1>
        <a
          href={`/admin/orders/export?${exportQuery.toString()}`}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium"
        >
          CSV татах
        </a>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <div>
          <label className="text-xs font-medium text-neutral-600">Эхлэх огноо</label>
          <input
            type="date"
            name="from"
            defaultValue={params.from}
            className="mt-1 block rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Дуусах огноо</label>
          <input
            type="date"
            name="to"
            defaultValue={params.to}
            className="mt-1 block rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Төлөв</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 block rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          >
            <option value="">Бүгд</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button className="rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-medium text-white">
          Шүүх
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <th className="px-4 py-2">Огноо</th>
              <th className="px-4 py-2">Ширээ</th>
              <th className="px-4 py-2">Хоолнууд</th>
              <th className="px-4 py-2">Нийт дүн</th>
              <th className="px-4 py-2">Төлөв</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-neutral-100 last:border-0">
                <td className="whitespace-nowrap px-4 py-2 text-xs text-neutral-500">
                  {new Date(order.created_at).toLocaleString("mn-MN")}
                </td>
                <td className="px-4 py-2">{order.table_number ?? "—"}</td>
                <td className="max-w-xs px-4 py-2 text-xs text-neutral-600">
                  {order.order_items
                    .map((line) => `${line.menu_items?.name ?? "?"} x${line.quantity}`)
                    .join(", ")}
                </td>
                <td className="whitespace-nowrap px-4 py-2 font-medium">
                  {Number(order.total_amount).toLocaleString()}₮
                </td>
                <td className="px-4 py-2">
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Захиалга олдсонгүй.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
