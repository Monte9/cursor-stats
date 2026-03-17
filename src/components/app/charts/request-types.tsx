"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: { kind: string; count: number }[];
}

const COLORS = ["#f97316", "#fb923c", "#71717a", "#52525b"];

function shortKind(kind: string): string {
  if (kind === "Errored, No Charge") return "Errored";
  if (kind === "Aborted, Not Charged") return "Aborted";
  return kind;
}

export function RequestTypesChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: shortKind(d.kind),
    value: d.count,
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-600 rounded-xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-lg font-semibold text-zinc-50 mb-4">
        Request Types
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              animationDuration={1500}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fafafa" }}
              itemStyle={{ color: "#f97316" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
