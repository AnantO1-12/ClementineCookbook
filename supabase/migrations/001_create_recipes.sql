create extension if not exists pgcrypto;

create or replace function public.set_recipe_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  category text,
  cuisine text,
  prep_time integer,
  cook_time integer,
  servings integer,
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  notes text,
  image_url text,
  is_favorite boolean not null default false,
  constraint recipes_title_not_empty check (char_length(trim(title)) > 0),
  constraint recipes_prep_time_non_negative check (prep_time is null or prep_time >= 0),
  constraint recipes_cook_time_non_negative check (cook_time is null or cook_time >= 0),
  constraint recipes_servings_positive check (servings is null or servings > 0)
);

create index if not exists recipes_created_at_idx on public.recipes (created_at desc);
create index if not exists recipes_user_id_idx on public.recipes (user_id);
create index if not exists recipes_category_idx on public.recipes (category);
create index if not exists recipes_title_lower_idx on public.recipes (lower(title));

create or replace trigger set_recipes_updated_at
before update on public.recipes
for each row
execute function public.set_recipe_updated_at();

alter table public.recipes enable row level security;

-- Anyone can browse recipes. This keeps the cookbook public-facing.
create policy "Recipes are viewable by everyone"
on public.recipes
for select
using (true);

-- Signed-in users may insert rows only when they set themselves as the owner.
create policy "Authenticated users can insert their own recipes"
on public.recipes
for insert
to authenticated
with check (auth.uid() = user_id);

-- Signed-in users may update only recipes they own.
create policy "Authenticated users can update their own recipes"
on public.recipes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Signed-in users may delete only recipes they own.
create policy "Authenticated users can delete their own recipes"
on public.recipes
for delete
to authenticated
using (auth.uid() = user_id);
