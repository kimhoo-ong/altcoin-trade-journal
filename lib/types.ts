export const STOP_LOSS_OPTIONS = ["swing", "signal low/high"] as const;
export const TAKE_PROFIT_OPTIONS = ["1:1", "previous level"] as const;
export const TRADE_DIRECTIONS = ["long", "short"] as const;
export const TRADE_STATUSES = ["open", "won", "lost"] as const;

export const AL_BROOKS_SETUPS = [
  "High 1",
  "High 2",
  "Low 1",
  "Low 2",
  "Wedge",
  "Double Top",
  "Double Bottom",
  "Micro Double Top",
  "Micro Double Bottom",
  "Final Flag",
  "Breakout Pullback",
  "Failed Breakout",
  "Trading Range Reversal",
  "Climactic Reversal",
  "Other"
] as const;

export type StopLossOption = (typeof STOP_LOSS_OPTIONS)[number];
export type TakeProfitOption = (typeof TAKE_PROFIT_OPTIONS)[number];
export type TradeDirection = (typeof TRADE_DIRECTIONS)[number];
export type TradeStatus = (typeof TRADE_STATUSES)[number];
export type AlBrooksSetup = (typeof AL_BROOKS_SETUPS)[number] | string;

export type Trade = {
  id: string;
  setup: string;
  custom_setup: string | null;
  direction: TradeDirection;
  stop_loss_type: StopLossOption;
  take_profit_type: TakeProfitOption;
  screenshot_url: string | null;
  notes: string | null;
  status: TradeStatus;
  opened_at: string;
  closed_at: string | null;
  created_at: string;
};

export type SetupStat = {
  setup: string;
  total: number;
  won: number;
  lost: number;
  winRate: number;
};

export type DashboardStats = {
  totalTrades: number;
  openTrades: number;
  wonTrades: number;
  lostTrades: number;
  closedTrades: number;
  overallWinRate: number;
  bySetup: SetupStat[];
};
