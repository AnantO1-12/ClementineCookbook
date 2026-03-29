insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-images',
  'recipe-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

-- Public read access keeps recipe cover images visible to anonymous visitors.
create policy "Recipe images are publicly readable"
on storage.objects
for select
using (bucket_id = 'recipe-images');

-- Authenticated users may upload only into a folder that matches their auth uid.
create policy "Authenticated users can upload recipe images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recipe-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users may update only files inside their own folder.
create policy "Authenticated users can update their recipe images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'recipe-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'recipe-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users may delete only files inside their own folder.
create policy "Authenticated users can delete their recipe images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'recipe-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
