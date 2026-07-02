"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#b91c1c", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#7c3aed", "#db2777"];

export function CategoryBreakdownChart({
  data,
}: {
  data: { category: string; revenue: number; pct: number }[];
}) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-neutral-600">Дата алга байна.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(props) => {
            const entry = props as unknown as { category: string; pct: number };
            return `${entry.category} ${entry.pct.toFixed(0)}%`;
          }}
        >
          {data.map((entry, index) => (
            <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${Number(value).toLocaleString()}₮`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
