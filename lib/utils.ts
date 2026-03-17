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

export function getTakeProfitLabel(
  takeProfitType: TakeProfitOption | string,
  direction: Trade["direction"]
) {
  if (takeProfitType === "previous level") {
    return direction === "short" ? "previous low" : "previous high";
  }

  return takeProfitType;
}

export function formatPnl(value: number) {
  return new Intl.NumberFormat("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
