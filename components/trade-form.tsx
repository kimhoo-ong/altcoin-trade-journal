"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MODEL_RECOMMENDATIONS, STOP_LOSS_OPTIONS, TAKE_PROFIT_OPTIONS, TRADE_DIRECTIONS } from "@/lib/types";
import { getTakeProfitLabel } from "@/lib/utils";

const initialMessage = "";

export function TradeForm() {
  const router = useRouter();
  const [direction, setDirection] = useState<(typeof TRADE_DIRECTIONS)[number]>(TRADE_DIRECTIONS[0]);
  const [message, setMessage] = useState(initialMessage);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setMessage(initialMessage);

    startTransition(async () => {
      const response = await fetch("/api/trades", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Could not create trade." }));
        setMessage(payload.error || "Could not create trade.");
        return;
      }

      form.reset();
      setDirection(TRADE_DIRECTIONS[0]);
      setMessage("Trade recorded.");
      router.refresh();
    });
  }

  return (
    <section className="panel">
      <div className="sectionHeading">
        <p className="eyebrow">New</p>
        <h2>New trade</h2>
      </div>
      <form className="tradeForm" onSubmit={handleSubmit}>
        <label>
          Coin
          <input name="coin" type="text" placeholder="BTC" maxLength={20} required />
        </label>

        <label>
          Model
          <select name="modelRecommendation" defaultValue={MODEL_RECOMMENDATIONS[0]}>
            {MODEL_RECOMMENDATIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Direction
          <select name="direction" value={direction} onChange={(event) => setDirection(event.target.value as (typeof TRADE_DIRECTIONS)[number])}>
            {TRADE_DIRECTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Stop loss
          <select name="stopLossType" defaultValue={STOP_LOSS_OPTIONS[0]}>
            {STOP_LOSS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Take profit
          <select name="takeProfitType" defaultValue={TAKE_PROFIT_OPTIONS[0]}>
            {TAKE_PROFIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {getTakeProfitLabel(option, direction)}
              </option>
            ))}
          </select>
        </label>

        <label className="fullWidth">
          Notes
          <textarea name="notes" rows={4} placeholder="Optional note" />
        </label>

        <div className="formActions">
          <button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </button>
          {message ? <p className="formMessage">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}
