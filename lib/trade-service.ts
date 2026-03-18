import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { DashboardStats, Trade } from "@/lib/types";

export async function listTrades(): Promise<Trade[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .order("opened_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as Trade[]) ?? [];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const trades = await listTrades();
  return buildStats(trades);
}

export function buildStats(trades: Trade[]): DashboardStats {
  const wonTrades = trades.filter((trade) => trade.status === "won").length;
  const lostTrades = trades.filter((trade) => trade.status === "lost").length;
  const openTrades = trades.filter((trade) => trade.status === "open").length;
  const closedTrades = wonTrades + lostTrades;
  const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl_amount ?? 0), 0);
  const dailyMap = new Map<string, { trades: number; wins: number; losses: number; pnl: number }>();
  const modelMap = new Map<Trade["model_recommendation"], { trades: number; wins: number; losses: number }>();

  for (const trade of trades) {
    const modelCurrent = modelMap.get(trade.model_recommendation) ?? { trades: 0, wins: 0, losses: 0 };
    modelCurrent.trades += 1;
    if (trade.status === "won") {
      modelCurrent.wins += 1;
    }
    if (trade.status === "lost") {
      modelCurrent.losses += 1;
    }
    modelMap.set(trade.model_recommendation, modelCurrent);

    if (!trade.closed_at) {
      continue;
    }

    const date = trade.closed_at.slice(0, 10);
    const current = dailyMap.get(date) ?? { trades: 0, wins: 0, losses: 0, pnl: 0 };
    current.trades += 1;
    if (trade.status === "won") {
      current.wins += 1;
    }
    if (trade.status === "lost") {
      current.losses += 1;
    }
    current.pnl += trade.pnl_amount ?? 0;
    dailyMap.set(date, current);
  }

  const dailyPnl = Array.from(dailyMap.entries())
    .map(([date, value]) => ({
      date,
      trades: value.trades,
      wins: value.wins,
      losses: value.losses,
      pnl: value.pnl,
      winRate: value.wins + value.losses === 0 ? 0 : Math.round((value.wins / (value.wins + value.losses)) * 100)
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const byModel = Array.from(modelMap.entries())
    .map(([model, value]) => ({
      model,
      trades: value.trades,
      wins: value.wins,
      losses: value.losses,
      winRate: value.wins + value.losses === 0 ? 0 : Math.round((value.wins / (value.wins + value.losses)) * 100)
    }))
    .sort((a, b) => a.model.localeCompare(b.model));

  return {
    totalTrades: trades.length,
    openTrades,
    wonTrades,
    lostTrades,
    closedTrades,
    overallWinRate: closedTrades === 0 ? 0 : Math.round((wonTrades / closedTrades) * 100),
    totalPnl,
    dailyPnl,
    byModel
  };
}

export async function createTrade({
  coin,
  modelRecommendation,
  direction,
  stopLossType,
  takeProfitType,
  notes
}: {
  coin: string;
  modelRecommendation: string;
  direction: string;
  stopLossType: string;
  takeProfitType: string;
  notes?: string;
}) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("trades")
    .insert({
      coin,
      model_recommendation: modelRecommendation,
      setup: "General",
      custom_setup: null,
      direction,
      stop_loss_type: stopLossType,
      take_profit_type: takeProfitType,
      pnl_amount: null,
      notes: notes || null,
      status: "open",
      opened_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Trade;
}

export async function settleTrade(id: string, status: "won" | "lost", pnlAmount: number) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trades")
    .update({
      status,
      pnl_amount: pnlAmount,
      closed_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("status", "open")
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Trade;
}
