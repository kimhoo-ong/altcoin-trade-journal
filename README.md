# Trade Journal

A simple Next.js journal for recording trades, marking wins or losses, and tracking basic stats.

## Stack

- Next.js App Router
- Supabase Database
- Vercel deployment

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add your Supabase project values to `.env.local`.

4. Run the app:

```bash
npm run dev
```

## Supabase schema

Run this SQL in the Supabase SQL editor:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  coin text not null,
  model_recommendation text not null check (model_recommendation in ('CC', 'GPT')),
  setup text not null,
  custom_setup text,
  direction text not null check (direction in ('long', 'short')),
  stop_loss_type text not null check (stop_loss_type in ('swing', 'signal low/high')),
  take_profit_type text not null check (take_profit_type in ('1:1', 'previous level')),
  pnl_amount numeric,
  notes text,
  status text not null default 'open' check (status in ('open', 'won', 'lost')),
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);
```

If your table already exists, run this too:

```sql
alter table public.trades
add column if not exists coin text not null default 'BTC';

alter table public.trades
add column if not exists model_recommendation text not null default 'CC';

alter table public.trades
add column if not exists pnl_amount numeric;
```
