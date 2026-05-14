-- =============================================================================
-- Book of Mormon Summer — Supabase SQL Schema
-- Paste this entire file into the Supabase SQL Editor and run it.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------

create extension if not exists "uuid-ossp";


-- ---------------------------------------------------------------------------
-- 1. Custom types
-- ---------------------------------------------------------------------------

create type member_role         as enum ('member', 'admin');
create type reminder_preference as enum ('email', 'sms', 'both');


-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- 2a. members -----------------------------------------------------------------
--     One row per authenticated user. Created via trigger on auth.users.

create table public.members (
  id                   uuid primary key references auth.users (id) on delete cascade,
  email                text               not null unique,
  full_name            text,
  role                 member_role        not null default 'member',
  phone                text,
  reminder_time        time,
  reminder_preference  reminder_preference,
  created_at           timestamptz        not null default now(),
  updated_at           timestamptz        not null default now()
);

comment on table public.members is
  'Application-level user profile, linked 1-to-1 with auth.users.';


-- 2b. check_ins ---------------------------------------------------------------
--     One row per member per day they read.

create table public.check_ins (
  id             uuid        primary key default uuid_generate_v4(),
  member_id      uuid        not null references public.members (id) on delete cascade,
  checked_in_at  timestamptz not null default now(),
  notes          text,
  created_at     timestamptz not null default now()
);

comment on table public.check_ins is
  'Records each day a member completes their reading.';

-- One check-in per member per calendar day (UTC).
create unique index check_ins_member_date_key
  on public.check_ins (member_id, (checked_in_at::date));


-- 2c. milestones --------------------------------------------------------------
--     Achievement definitions. Managed by admins.

create table public.milestones (
  id                  uuid        primary key default uuid_generate_v4(),
  name                text        not null unique,
  description         text        not null,
  required_check_ins  int         not null check (required_check_ins > 0),
  badge_url           text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.milestones is
  'Achievement thresholds that members can earn throughout the summer.';


-- 2d. member_milestones -------------------------------------------------------
--     Join table recording which milestones each member has earned.

create table public.member_milestones (
  id           uuid        primary key default uuid_generate_v4(),
  member_id    uuid        not null references public.members (id) on delete cascade,
  milestone_id uuid        not null references public.milestones (id) on delete cascade,
  earned_at    timestamptz not null default now(),

  unique (member_id, milestone_id)
);

comment on table public.member_milestones is
  'Tracks which milestones each member has earned and when.';


-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------

create index on public.check_ins (member_id);
create index on public.member_milestones (member_id);
create index on public.member_milestones (milestone_id);


-- ---------------------------------------------------------------------------
-- 4. updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.members
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.milestones
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- 5. Auto-create member row when a new user signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.members (id, email, full_name, phone, reminder_time, reminder_preference)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'phone', null),
    coalesce((new.raw_user_meta_data->>'reminder_time')::time, null),
    coalesce(new.raw_user_meta_data->>'reminder_preference', null)::reminder_preference
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 6. Admin helper
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.members
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ---------------------------------------------------------------------------
-- 7. Row Level Security
-- ---------------------------------------------------------------------------

-- ── members ────────────────────────────────────────────────────────────────

alter table public.members enable row level security;

create policy "members: select own or admin"
  on public.members for select
  using (id = auth.uid() or public.is_admin());

create policy "members: insert own"
  on public.members for insert
  with check (id = auth.uid());

create policy "members: update own or admin"
  on public.members for update
  using  (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "members: delete admin only"
  on public.members for delete
  using (public.is_admin());


-- ── check_ins ──────────────────────────────────────────────────────────────

alter table public.check_ins enable row level security;

create policy "check_ins: select own or admin"
  on public.check_ins for select
  using (member_id = auth.uid() or public.is_admin());

create policy "check_ins: insert own"
  on public.check_ins for insert
  with check (member_id = auth.uid());

create policy "check_ins: update own or admin"
  on public.check_ins for update
  using  (member_id = auth.uid() or public.is_admin())
  with check (member_id = auth.uid() or public.is_admin());

create policy "check_ins: delete own or admin"
  on public.check_ins for delete
  using (member_id = auth.uid() or public.is_admin());


-- ── milestones ─────────────────────────────────────────────────────────────

alter table public.milestones enable row level security;

create policy "milestones: select authenticated"
  on public.milestones for select
  using (auth.role() = 'authenticated');

create policy "milestones: insert admin"
  on public.milestones for insert
  with check (public.is_admin());

create policy "milestones: update admin"
  on public.milestones for update
  using  (public.is_admin())
  with check (public.is_admin());

create policy "milestones: delete admin"
  on public.milestones for delete
  using (public.is_admin());


-- ── member_milestones ──────────────────────────────────────────────────────

alter table public.member_milestones enable row level security;

create policy "member_milestones: select own or admin"
  on public.member_milestones for select
  using (member_id = auth.uid() or public.is_admin());

create policy "member_milestones: insert admin"
  on public.member_milestones for insert
  with check (public.is_admin());

create policy "member_milestones: update admin"
  on public.member_milestones for update
  using  (public.is_admin())
  with check (public.is_admin());

create policy "member_milestones: delete admin"
  on public.member_milestones for delete
  using (public.is_admin());


-- ---------------------------------------------------------------------------
-- 8. Seed data — milestones
-- ---------------------------------------------------------------------------

insert into public.milestones (name, description, required_check_ins)
values
  ('First Step',     'Complete your first daily reading.',                   1),
  ('One Week',       'Read for 7 days.',                                     7),
  ('One Month',      'Complete 30 readings — a whole month of scripture.',   30),
  ('Halfway There',  'Reach the halfway point of a 90-day summer.',          45),
  ('Two Months',     'Read for 60 days — over halfway to a full summer.',    60),
  ('Summer Scholar', 'Complete all 90 readings. You did it!',                90);
