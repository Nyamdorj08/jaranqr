import { getDashboardMetrics } from "@/lib/data";
import { RevenueTrendChart } from "@/components/charts/revenue-trend-chart";

function formatMnt(value: number) {
  return `${Math.round(value).toLocaleString()}₮`;
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();
  const growthLabel =
    metrics.growthPct === null ? "—" : `${metrics.growthPct >= 0 ? "+" : ""}${metrics.growthPct.toFixed(1)}%`;
  const growthColor =
    metrics.growthPct === null
      ? "text-neutral-600"
      : metrics.growthPct >= 0
        ? "text-green-600"
        : "text-red-600";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-brand-secondary">Хянах самбар</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Өнөөдрийн орлого" value={formatMnt(metrics.todayRevenue)} />
        <MetricCard label="Энэ сарын орлого" value={formatMnt(metrics.monthRevenue)} />
        <MetricCard
          label="Өмнөх сартай харьцуулсан"
          value={growthLabel}
          valueClassName={growthColor}
        />
        <MetricCard label="Дундаж захиалгын үнэ" value={formatMnt(metrics.averageOrderValue)} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">
          Сүүлийн 30 хоногийн борлуулалт
        </h2>
        <RevenueTrendChart data={metrics.trend} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">Хамгийн их зарагдсан 5 хоол</h2>
        {metrics.topItems.length === 0 ? (
          <p className="text-sm text-neutral-600">Энэ сард захиалга алга байна.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {metrics.topItems.map((item, index) => (
              <li key={item.name} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{item.quantity} ширхэг</p>
                  <p className="text-xs text-neutral-600">{formatMnt(item.revenue)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-600">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${valueClassName ?? "text-brand-secondary"}`}>
        {value}
      </p>
    </div>
  );
}
