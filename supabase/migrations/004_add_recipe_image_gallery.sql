alter table public.recipes
add column if not exists image_urls jsonb not null default '[]'::jsonb;

update public.recipes
set image_urls = case
  when image_url is null or char_length(trim(image_url)) = 0 then '[]'::jsonb
  else jsonb_build_array(image_url)
end
where jsonb_array_length(image_urls) = 0;
