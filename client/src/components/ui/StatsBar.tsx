import { useAppSelector } from "../../hooks/redux";
import type { ApplicationStatus } from "../../types";
import { STATUS_DOT_COLORS, KANBAN_COLUMNS } from "../../types";

export default function StatsBar() {
  const { items } = useAppSelector((s) => s.applications);

  const counts = KANBAN_COLUMNS.reduce<Record<ApplicationStatus, number>>(
    (acc, col) => {
      acc[col] = items.filter((a) => a.status === col).length;
      return acc;
    },
    {} as Record<ApplicationStatus, number>
  );

  const offerRate = items.length
    ? Math.round((counts["Offer"] / items.length) * 100)
    : 0;

  return (
    <div className="flex flex-wrap items-center gap-4 px-1 mb-2">
      {KANBAN_COLUMNS.map((col) => (
        <div key={col} className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[col]}`} />
          <span className="text-xs text-slate-400 font-medium">{col}</span>
          <span className="text-xs font-mono font-bold text-slate-300">{counts[col]}</span>
        </div>
      ))}
      {items.length > 0 && (
        <div className="ml-auto flex items-center gap-1.5 text-xs">
          <span className="text-slate-500">Offer rate:</span>
          <span className="font-mono font-bold text-emerald-400">{offerRate}%</span>
        </div>
      )}
    </div>
  );
}
