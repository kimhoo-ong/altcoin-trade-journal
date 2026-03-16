import { StatsStrip } from "@/components/stats-strip";
import { TradeBoard } from "@/components/trade-board";
import { TradeForm } from "@/components/trade-form";
import { getDashboardStats, listTrades } from "@/lib/trade-service";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trades, stats] = await Promise.all([listTrades(), getDashboardStats()]);
  const isConfigured = isSupabaseConfigured();

  return (
    <main className="pageShell">
      <section className="heroShell">
        <section className="hero panel">
          <div>
            <p className="eyebrow">Trade Journal</p>
            <h1>Log. Track. Review.</h1>
          </div>
          <div className="heroBadgeWrap">
            <div className="heroBadge">Open {stats.openTrades}</div>
            <div className="heroBadge coral">Win {stats.overallWinRate}%</div>
          </div>
        </section>

        <section className="heroMini panel">
          <p className="eyebrow">Today</p>
          <div className="miniStatRow">
            <strong>{stats.totalTrades}</strong>
            <span>Trades</span>
          </div>
          <div className="miniStatRow">
            <strong>{stats.bySetup[0]?.setup ?? "No setup"}</strong>
            <span>Top setup</span>
          </div>
        </section>
      </section>

      {!isConfigured ? (
        <section className="warningBanner">
          Add Supabase keys to save data.
        </section>
      ) : null}

      <StatsStrip stats={stats} />
      <div className="topGrid">
        <TradeForm />
        <section className="panel guideCard posterCard">
          <div className="sectionHeading">
            <p className="eyebrow">Flow</p>
            <h2>Simple.</h2>
          </div>
          <div className="posterArt">
            <div className="posterCircle" />
            <div className="posterBlock">
              <span>Entry</span>
              <strong>Screenshot</strong>
            </div>
            <div className="posterBlock peach">
              <span>Exit</span>
              <strong>Profit / Loss</strong>
            </div>
          </div>
        </section>
      </div>
      <TradeBoard trades={trades} stats={stats} />
    </main>
  );
}
