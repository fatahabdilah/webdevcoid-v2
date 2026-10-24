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

-- Studio accounts kept in the database (besides the ones in env): sign in with email + password. password_hash is
-- "scrypt:<salt hex>:<hash hex>", made by `npm run admin:setup` or the seed in docs/AI-CONTEXT.md; never a password.
create table if not exists public.admin_users (
  email          text primary key check (email = lower(email)),
  password_hash  text not null check (password_hash like 'scrypt:%'),
  role           text not null default 'owner' check (role in ('owner', 'team')),
  name           text,
  created_at     timestamptz not null default now()
);

alter table public.admin_docs  enable row level security;
alter table public.admin_inbox enable row level security;
alter table public.admin_users enable row level security;

-- Newer Supabase projects no longer grant table access to the API roles by default: give it to the server's secret
-- key only (service_role). anon and authenticated get nothing.
grant select, insert, update, delete on public.admin_docs  to service_role;
grant select, insert, update, delete on public.admin_inbox to service_role;
grant select, insert, update, delete on public.admin_users to service_role;

-- Studio images (slide previews), served at /_blob/<name> to signed-in accounts (src/lib/admin/blobs.ts).
-- A private bucket: only the server's secret key reads and writes it.
insert into storage.buckets (id, name, public)
values ('admin-blobs', 'admin-blobs', false)
on conflict (id) do nothing;
