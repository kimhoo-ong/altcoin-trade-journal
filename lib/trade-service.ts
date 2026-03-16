import { getBucketName, getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { DashboardStats, SetupStat, Trade } from "@/lib/types";
import { getDisplaySetup } from "@/lib/utils";

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

  const setupMap = trades.reduce<Map<string, { total: number; won: number; lost: number }>>((map, trade) => {
    const key = getDisplaySetup(trade);
    const current = map.get(key) ?? { total: 0, won: 0, lost: 0 };
    current.total += 1;
    if (trade.status === "won") {
      current.won += 1;
    }
    if (trade.status === "lost") {
      current.lost += 1;
    }
    map.set(key, current);
    return map;
  }, new Map());

  const bySetup: SetupStat[] = Array.from(setupMap.entries())
    .map(([setup, values]) => ({
      setup,
      total: values.total,
      won: values.won,
      lost: values.lost,
      winRate: values.won + values.lost === 0 ? 0 : Math.round((values.won / (values.won + values.lost)) * 100)
    }))
    .sort((a, b) => b.total - a.total || a.setup.localeCompare(b.setup));

  return {
    totalTrades: trades.length,
    openTrades,
    wonTrades,
    lostTrades,
    closedTrades,
    overallWinRate: closedTrades === 0 ? 0 : Math.round((wonTrades / closedTrades) * 100),
    bySetup
  };
}

export async function createTrade({
  setup,
  customSetup,
  direction,
  stopLossType,
  takeProfitType,
  notes,
  screenshot
}: {
  setup: string;
  customSetup?: string;
  direction: string;
  stopLossType: string;
  takeProfitType: string;
  notes?: string;
  screenshot?: File | null;
}) {
  const supabase = getSupabaseAdminClient();
  let screenshotUrl: string | null = null;

  if (screenshot && screenshot.size > 0) {
    const filename = `${Date.now()}-${screenshot.name.replaceAll(/\s+/g, "-")}`;
    const arrayBuffer = await screenshot.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(getBucketName())
      .upload(filename, arrayBuffer, {
        contentType: screenshot.type || "image/png",
        upsert: false
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(getBucketName()).getPublicUrl(filename);
    screenshotUrl = data.publicUrl;
  }

  const { data, error } = await supabase
    .from("trades")
    .insert({
      setup,
      custom_setup: customSetup || null,
      direction,
      stop_loss_type: stopLossType,
      take_profit_type: takeProfitType,
      notes: notes || null,
      screenshot_url: screenshotUrl,
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

export async function settleTrade(id: string, status: "won" | "lost") {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trades")
    .update({
      status,
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
