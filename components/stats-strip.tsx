import { DashboardStats } from "@/lib/types";
import { formatPnl } from "@/lib/utils";

type StatKey = "totalTrades" | "openTrades" | "wonTrades" | "overallWinRate" | "totalPnl";

const labels: Array<{ key: StatKey; label: string }> = [
  { key: "totalTrades", label: "Total" },
  { key: "openTrades", label: "Open" },
  { key: "wonTrades", label: "Won" },
  { key: "overallWinRate", label: "Win %" },
  { key: "totalPnl", label: "Total P/L" }
];

export function StatsStrip({ stats }: { stats: DashboardStats }) {
  return (
    <section className="statsStrip">
      {labels.map(({ key, label }) => (
        <article key={key} className="statCard">
          <span>{label}</span>
          <strong>
            {key === "overallWinRate"
              ? `${stats[key]}%`
              : key === "totalPnl"
                ? formatPnl(stats.totalPnl)
                : stats[key]}
          </strong>
        </article>
      ))}
    </section>
  );
}
