import { ReactNode } from "react";

interface ChartCardProps {
  children: ReactNode;
}

export function ChartCard({ children }: ChartCardProps) {
  return (
    <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6 shadow-xl shadow-black/30 overflow-hidden">
      {/* Window dots */}
      <div className="absolute top-4 left-5 flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
      </div>

      {/* Watermark */}
      <span className="absolute top-4 right-5 text-zinc-600 text-xs font-mono">
        cursorstats.com
      </span>

      {/* Content with top padding for dots */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
