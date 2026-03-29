-- This app assumes a single personal admin account.
-- If seed data or older rows were created by a different auth user,
-- owner-based RLS prevents favorites, edits, and deletes from working.
-- These policies allow any authenticated user to manage recipes.

drop policy if exists "Authenticated users can insert their own recipes" on public.recipes;
drop policy if exists "Authenticated users can update their own recipes" on public.recipes;
drop policy if exists "Authenticated users can delete their own recipes" on public.recipes;

create policy "Authenticated users can insert recipes"
on public.recipes
for insert
to authenticated
with check (auth.role() = 'authenticated');

create policy "Authenticated users can update recipes"
on public.recipes
for update
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete recipes"
on public.recipes
for delete
to authenticated
using (auth.role() = 'authenticated');
