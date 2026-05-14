-- =============================================================================
-- Migration: add reminder fields to members
-- Run this in the Supabase SQL Editor AFTER the initial schema.sql.
-- =============================================================================

-- 1. New enum for reminder preference
create type reminder_preference as enum ('email', 'sms', 'both');

-- 2. New columns on members
alter table public.members
  add column if not exists phone              text,
  add column if not exists reminder_time      time,
  add column if not exists reminder_preference reminder_preference;

-- 3. Updated trigger — now reads all signup metadata from auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.members (
    id,
    email,
    full_name,
    phone,
    reading_plan_id,
    plan_start_date,
    reminder_time,
    reminder_preference
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'phone', null),
    coalesce((new.raw_user_meta_data->>'reading_plan_id')::uuid, null),
    coalesce((new.raw_user_meta_data->>'plan_start_date')::date, current_date),
    coalesce((new.raw_user_meta_data->>'reminder_time')::time, null),
    coalesce(new.raw_user_meta_data->>'reminder_preference', null)::reminder_preference
  );
  return new;
end;
$$;
