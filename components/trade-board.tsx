"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DashboardStats, Trade } from "@/lib/types";
import { cn, formatDateTime, getDisplaySetup, getTakeProfitLabel } from "@/lib/utils";

function TradeCard({ trade }: { trade: Trade }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function settle(status: "won" | "lost") {
    setMessage("");

    startTransition(async () => {
      const response = await fetch(`/api/trades/${trade.id}/settle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Update failed." }));
        setMessage(payload.error || "Update failed.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <article className="tradeCard">
      <div className="tradeCardTop">
        <div>
          <p className="tradeSetup">
            {trade.coin} · {getDisplaySetup(trade)}
          </p>
          <p className="tradeMeta">
            {trade.direction} · SL {trade.stop_loss_type} · TP {getTakeProfitLabel(trade.take_profit_type, trade.direction)}
          </p>
        </div>
        <span className={cn("statusPill", trade.status)}>{trade.status}</span>
      </div>

      {trade.screenshot_url ? (
        <div className="tradeImageWrap">
          <Image
            src={trade.screenshot_url}
            alt={`${getDisplaySetup(trade)} screenshot`}
            width={800}
            height={480}
            className="tradeImage"
            unoptimized
          />
        </div>
      ) : null}

      <dl className="tradeDates">
        <div>
          <dt>Opened</dt>
          <dd>{formatDateTime(trade.opened_at)}</dd>
        </div>
        <div>
          <dt>Closed</dt>
          <dd>{formatDateTime(trade.closed_at)}</dd>
        </div>
      </dl>

      {trade.notes ? <p className="tradeNotes">{trade.notes}</p> : null}

      {trade.status === "open" ? (
        <div className="tradeActions">
          <button disabled={isPending} className="positive" onClick={() => settle("won")}>
            Mark profit
          </button>
          <button disabled={isPending} className="negative" onClick={() => settle("lost")}>
            Mark loss
          </button>
        </div>
      ) : null}

      {message ? <p className="formMessage">{message}</p> : null}
    </article>
  );
}

function SetupStatsTable({ stats }: { stats: DashboardStats }) {
  return (
    <section className="panel">
        <div className="sectionHeading">
          <p className="eyebrow">Stats</p>
          <h2>By setup</h2>
        </div>

      {stats.bySetup.length === 0 ? (
        <p className="emptyState">No setup stats yet. Close a few trades to see your edge by pattern.</p>
      ) : (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Setup</th>
                <th>Total</th>
                <th>Won</th>
                <th>Lost</th>
                <th>Win rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.bySetup.map((row) => (
                <tr key={row.setup}>
                  <td>{row.setup}</td>
                  <td>{row.total}</td>
                  <td>{row.won}</td>
                  <td>{row.lost}</td>
                  <td>{row.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function TradeBoard({ trades, stats }: { trades: Trade[]; stats: DashboardStats }) {
  const openTrades = trades.filter((trade) => trade.status === "open");
  const wonTrades = trades.filter((trade) => trade.status === "won");
  const lostTrades = trades.filter((trade) => trade.status === "lost");

  return (
    <div className="boardGrid">
      <section className="panel">
        <div className="sectionHeading">
          <p className="eyebrow">Live</p>
          <h2>Open</h2>
        </div>
        <div className="tradeList">
          {openTrades.length === 0 ? (
            <p className="emptyState">No open trades at the moment.</p>
          ) : (
            openTrades.map((trade) => <TradeCard key={trade.id} trade={trade} />)
          )}
        </div>
      </section>

      <section className="panel">
        <div className="sectionHeading">
          <p className="eyebrow">Closed</p>
          <h2>Won</h2>
        </div>
        <div className="tradeList compactList">
          {wonTrades.length === 0 ? (
            <p className="emptyState">Your winning trades will appear here.</p>
          ) : (
            wonTrades.map((trade) => <TradeCard key={trade.id} trade={trade} />)
          )}
        </div>
      </section>

      <section className="panel">
        <div className="sectionHeading">
          <p className="eyebrow">Closed</p>
          <h2>Lost</h2>
        </div>
        <div className="tradeList compactList">
          {lostTrades.length === 0 ? (
            <p className="emptyState">Losing trades will show here for review.</p>
          ) : (
            lostTrades.map((trade) => <TradeCard key={trade.id} trade={trade} />)
          )}
        </div>
      </section>

      <SetupStatsTable stats={stats} />
    </div>
  );
}
