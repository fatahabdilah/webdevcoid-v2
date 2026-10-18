-- /admin storage (src/lib/admin/store.ts). Run once in Supabase → SQL Editor.
-- RLS is on and there are no policies, so the public anon key can read nothing; only the server, with the
-- secret key (SUPABASE_SECRET_KEY, which bypasses RLS), reads and writes these tables.

-- The Studio's board documents: board/state (design) and board/sales (sales).
create table if not exists public.admin_docs (
  path        text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- The Studio's inbox: approvals, revisions and commands sent from its buttons.
create table if not exists public.admin_inbox (
  id          uuid primary key default gen_random_uuid(),
  item        jsonb not null,
  at          timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists admin_inbox_at_idx on public.admin_inbox (at desc nulls last, created_at desc);

alter table public.admin_docs  enable row level security;
alter table public.admin_inbox enable row level security;
