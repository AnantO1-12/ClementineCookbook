import { assertSupabaseEnv } from '../lib/env';
import { supabase } from '../lib/supabase';
import type { Recipe, RecipeMutationInput, RecipeRecord } from '../types/recipe';
import type { Json } from '../types/supabase';
import { slugify } from '../utils/slug';

const IMAGE_BUCKET = 'recipe-images';

function toStringArray(value: Json): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeRecipe(record: RecipeRecord): Recipe {
  return {
    ...record,
    ingredients: toStringArray(record.ingredients),
    instructions: toStringArray(record.instructions),
  };
}

function cleanNullableString(value: string | null) {
  const nextValue = value?.trim();

  return nextValue ? nextValue : null;
}

async function buildUniqueSlug(title: string, excludeId?: string) {
  assertSupabaseEnv();

  const baseSlug = slugify(title);
  let query = supabase.from('recipes').select('id, slug').ilike('slug', `${baseSlug}%`);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const usedSlugs = new Set((data ?? []).map((item) => item.slug));

  if (!usedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let nextSlug = `${baseSlug}-${suffix}`;

  while (usedSlugs.has(nextSlug)) {
    suffix += 1;
    nextSlug = `${baseSlug}-${suffix}`;
  }

  return nextSlug;
}

function buildRecipePayload(input: RecipeMutationInput, slug: string) {
  return {
    title: input.title.trim(),
    slug,
    description: cleanNullableString(input.description),
    category: cleanNullableString(input.category),
    cuisine: cleanNullableString(input.cuisine),
    prep_time: input.prep_time ?? null,
    cook_time: input.cook_time ?? null,
    servings: input.servings ?? null,
    ingredients: input.ingredients,
    instructions: input.instructions,
    notes: cleanNullableString(input.notes),
    image_url: cleanNullableString(input.image_url),
    is_favorite: input.is_favorite,
  };
}

export async function getAllRecipes() {
  assertSupabaseEnv();

  const { data, error } = await supabase.from('recipes').select('*').order('created_at', {
    ascending: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeRecipe);
}

export async function getRecipeBySlug(slug: string) {
  assertSupabaseEnv();

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeRecipe(data) : null;
}

export async function createRecipe(input: RecipeMutationInput, userId: string) {
  assertSupabaseEnv();

  const slug = await buildUniqueSlug(input.title);
  const insertPayload = {
    ...buildRecipePayload(input, slug),
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('recipes')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeRecipe(data);
}

export async function updateRecipe(id: string, input: RecipeMutationInput) {
  assertSupabaseEnv();

  const slug = await buildUniqueSlug(input.title, id);

  const { data, error } = await supabase
    .from('recipes')
    .update(buildRecipePayload(input, slug))
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeRecipe(data);
}

export async function deleteRecipe(id: string) {
  assertSupabaseEnv();

  const { error } = await supabase.from('recipes').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  assertSupabaseEnv();

  const { data, error } = await supabase
    .from('recipes')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (error.message.toLowerCase().includes('row-level security')) {
      throw new Error(
        'Favorite updates are blocked by your current Supabase policy. Run the latest recipe policy migration in Supabase, then try again.',
      );
    }

    throw new Error(error.message);
  }

  return normalizeRecipe(data);
}

export async function uploadRecipeImage(file: File, userId: string, title: string) {
  assertSupabaseEnv();

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filePath = `${userId}/${Date.now()}-${slugify(title)}.${extension}`;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(
      `${error.message}. If you skipped storage setup, switch the form to image URL mode.`,
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}
