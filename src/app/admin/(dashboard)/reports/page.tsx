import { getMonthlyReport } from "@/lib/data";
import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";

function parseMonth(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split("-").map(Number);
    return new Date(year, m - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function toMonthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const monthStart = parseMonth(params.month);
  const report = await getMonthlyReport(monthStart);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-brand-secondary">Тайлан</h1>
        <form className="flex items-center gap-2">
          <input
            type="month"
            name="month"
            defaultValue={toMonthValue(monthStart)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
          <button className="rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-medium text-white">
            Харах
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Сарын нийт орлого</p>
          <p className="mt-1 text-lg font-semibold text-brand-secondary">
            {report.totalRevenue.toLocaleString()}₮
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Захиалгын тоо</p>
          <p className="mt-1 text-lg font-semibold text-brand-secondary">{report.orderCount}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Дундаж захиалга</p>
          <p className="mt-1 text-lg font-semibold text-brand-secondary">
            {report.orderCount === 0
              ? "0₮"
              : `${Math.round(report.totalRevenue / report.orderCount).toLocaleString()}₮`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-neutral-700">Ангилалаар задаргаа</h2>
          <CategoryBreakdownChart data={report.categoryBreakdown} />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">Хамгийн их зарагдсан хоол</h2>
          {report.bestSellers.length === 0 ? (
            <p className="text-sm text-neutral-600">Энэ сард захиалга алга байна.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {report.bestSellers.map((item, index) => (
                <li key={item.name} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{item.quantity} ширхэг</p>
                    <p className="text-xs text-neutral-600">{item.revenue.toLocaleString()}₮</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
