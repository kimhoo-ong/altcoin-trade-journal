"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DashboardStats, Trade } from "@/lib/types";
import { cn, formatDateTime, formatPnl, getTakeProfitLabel } from "@/lib/utils";

function TradeCard({ trade }: { trade: Trade }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pnlAmount, setPnlAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  async function settle(status: "won" | "lost") {
    setMessage("");
    const parsedPnl = Number(pnlAmount);

    if (pnlAmount.trim() === "" || Number.isNaN(parsedPnl)) {
      setMessage("Enter P/L first.");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/trades/${trade.id}/settle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, pnlAmount: parsedPnl })
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
            {trade.coin}
          </p>
          <p className="tradeMeta">
            {trade.direction} · SL {trade.stop_loss_type} · TP {getTakeProfitLabel(trade.take_profit_type, trade.direction)}
          </p>
        </div>
        <span className={cn("statusPill", trade.status)}>{trade.status}</span>
      </div>

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

      {trade.pnl_amount !== null ? (
        <p className="tradePnl">P/L {trade.pnl_amount > 0 ? "+" : ""}{formatPnl(trade.pnl_amount)}</p>
      ) : null}

      {trade.notes ? <p className="tradeNotes">{trade.notes}</p> : null}

      {trade.status === "open" ? (
        <div className="settleWrap">
          <label className="pnlField">
            P/L
            <input
              type="number"
              step="0.01"
              placeholder="120.50"
              value={pnlAmount}
              onChange={(event) => setPnlAmount(event.target.value)}
            />
          </label>
          <div className="tradeActions">
          <button disabled={isPending} className="positive" onClick={() => settle("won")}>
            Win
          </button>
          <button disabled={isPending} className="negative" onClick={() => settle("lost")}>
            Loss
          </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="formMessage">{message}</p> : null}
    </article>
  );
}

function DailyPnlSection({ stats }: { stats: DashboardStats }) {
  return (
    <section className="panel">
      <div className="sectionHeading">
        <p className="eyebrow">Summary</p>
        <h2>Daily P/L</h2>
      </div>
      {stats.dailyPnl.length === 0 ? (
        <p className="emptyState">Close trades to see daily P/L.</p>
      ) : (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Trades</th>
                <th>P/L</th>
                <th>Win %</th>
              </tr>
            </thead>
            <tbody>
              {stats.dailyPnl.map((day) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{day.trades}</td>
                  <td>{day.pnl > 0 ? "+" : ""}{formatPnl(day.pnl)}</td>
                  <td>{day.winRate}%</td>
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
  const closedTrades = trades.filter((trade) => trade.status !== "open");

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
          <p className="eyebrow">History</p>
          <h2>Closed</h2>
        </div>
        <div className="tradeList compactList">
          {closedTrades.length === 0 ? (
            <p className="emptyState">Closed trades will appear here.</p>
          ) : (
            closedTrades.map((trade) => <TradeCard key={trade.id} trade={trade} />)
          )}
        </div>
      </section>
      <DailyPnlSection stats={stats} />
    </div>
  );
}
