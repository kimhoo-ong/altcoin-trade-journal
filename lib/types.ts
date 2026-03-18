export const STOP_LOSS_OPTIONS = ["swing", "signal low/high"] as const;
export const TAKE_PROFIT_OPTIONS = ["1:1", "previous level"] as const;
export const TRADE_DIRECTIONS = ["long", "short"] as const;
export const TRADE_STATUSES = ["open", "won", "lost"] as const;
export const MODEL_RECOMMENDATIONS = ["CC", "GPT"] as const;

export type StopLossOption = (typeof STOP_LOSS_OPTIONS)[number];
export type TakeProfitOption = (typeof TAKE_PROFIT_OPTIONS)[number];
export type TradeDirection = (typeof TRADE_DIRECTIONS)[number];
export type TradeStatus = (typeof TRADE_STATUSES)[number];
export type ModelRecommendation = (typeof MODEL_RECOMMENDATIONS)[number];

export type Trade = {
  id: string;
  coin: string;
  model_recommendation: ModelRecommendation;
  setup: string;
  custom_setup: string | null;
  direction: TradeDirection;
  stop_loss_type: StopLossOption;
  take_profit_type: TakeProfitOption;
  pnl_amount: number | null;
  notes: string | null;
  status: TradeStatus;
  opened_at: string;
  closed_at: string | null;
  created_at: string;
};

export type DailyPnl = {
  date: string;
  trades: number;
  wins: number;
  losses: number;
  pnl: number;
  winRate: number;
};

export type DashboardStats = {
  totalTrades: number;
  openTrades: number;
  wonTrades: number;
  lostTrades: number;
  closedTrades: number;
  overallWinRate: number;
  totalPnl: number;
  dailyPnl: DailyPnl[];
};
