import { TakeProfitOption, Trade } from "@/lib/types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Not closed yet";
  }

  return new Intl.DateTimeFormat("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getDisplaySetup(trade: Pick<Trade, "setup" | "custom_setup">) {
  if (trade.setup === "Other" && trade.custom_setup) {
    return trade.custom_setup;
  }

  return trade.setup;
}

export function getTakeProfitLabel(
  takeProfitType: TakeProfitOption | string,
  direction: Trade["direction"]
) {
  if (takeProfitType === "previous level") {
    return direction === "short" ? "previous low" : "previous high";
  }

  return takeProfitType;
}
