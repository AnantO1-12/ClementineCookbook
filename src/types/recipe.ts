import type { Database } from './supabase';

export type RecipeRecord = Database['public']['Tables']['recipes']['Row'];

export interface Recipe {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  cuisine: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  ingredients: string[];
  instructions: string[];
  notes: string | null;
  image_url: string | null;
  is_favorite: boolean;
}

export interface RecipeFormValues {
  title: string;
  description: string;
  category: string;
  cuisine: string;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  ingredients: string[];
  instructions: string[];
  notes: string;
  image_url: string;
  is_favorite: boolean;
}

export interface RecipeMutationInput {
  title: string;
  description: string | null;
  category: string | null;
  cuisine: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  ingredients: string[];
  instructions: string[];
  notes: string | null;
  image_url: string | null;
  is_favorite: boolean;
}

export type FormErrors = Partial<
  Record<keyof RecipeFormValues | 'ingredients' | 'instructions' | 'submit', string>
>;
