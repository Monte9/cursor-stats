interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatCard({ label, value, accent = false }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
      <p className="text-zinc-400 text-sm mb-1">{label}</p>
      <p
        className={`text-3xl font-semibold ${accent ? "text-orange-500" : "text-zinc-50"}`}
      >
        {value}
      </p>
    </div>
  );
}
