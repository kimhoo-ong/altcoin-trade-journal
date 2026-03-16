import { DashboardStats } from "@/lib/types";

type StatKey = "totalTrades" | "openTrades" | "wonTrades" | "lostTrades" | "overallWinRate";

const labels: Array<{ key: StatKey; label: string }> = [
  { key: "totalTrades", label: "Total" },
  { key: "openTrades", label: "Open" },
  { key: "wonTrades", label: "Won" },
  { key: "lostTrades", label: "Lost" },
  { key: "overallWinRate", label: "Win %" }
];

export function StatsStrip({ stats }: { stats: DashboardStats }) {
  return (
    <section className="statsStrip">
      {labels.map(({ key, label }) => (
        <article key={key} className="statCard">
          <span>{label}</span>
          <strong>{key === "overallWinRate" ? `${stats[key]}%` : stats[key]}</strong>
        </article>
      ))}
    </section>
  );
}
