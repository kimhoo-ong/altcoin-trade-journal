# Al Brooks Trade Journal

A simple white-style Next.js journal for logging trades, screenshots, stop loss / take profit choices, and win rates by setup.

## Stack

- Next.js App Router
- Supabase Database
- Supabase Storage
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
  setup text not null,
  custom_setup text,
  direction text not null check (direction in ('long', 'short')),
  stop_loss_type text not null check (stop_loss_type in ('swing', 'signal low/high')),
  take_profit_type text not null check (take_profit_type in ('1:1', 'previous level')),
  screenshot_url text,
  notes text,
  status text not null default 'open' check (status in ('open', 'won', 'lost')),
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);
```

Create a public storage bucket named `trade-screenshots` if you keep the default bucket name.

## Vercel deployment

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Add the same environment variables from `.env.local` into the Vercel project settings.
4. Deploy.

## Screenshot storage suggestion

If you worry about storage:

- Resize screenshots on the client before upload to around 1600px wide and compress to WebP or JPEG.
- Keep only one screenshot per trade in the main bucket and archive older raw screenshots elsewhere.
- Start with Supabase Storage because it is simple, then move images to Cloudflare R2 or S3 later if screenshot volume grows.
