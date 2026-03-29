import type { Recipe } from '../types/recipe';

export function formatMinutes(minutes: number | null) {
  if (!minutes || minutes <= 0) {
    return '0 min';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!remainingMinutes) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

export function formatPrepCook(recipe: Pick<Recipe, 'prep_time' | 'cook_time'>) {
  const prep = formatMinutes(recipe.prep_time);
  const cook = formatMinutes(recipe.cook_time);

  return `Prep ${prep} · Cook ${cook}`;
}

export function getTotalTime(recipe: Pick<Recipe, 'prep_time' | 'cook_time'>) {
  const total = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);

  return formatMinutes(total);
}

export function formatRecipeDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function sentenceCase(value: string | null | undefined) {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function normalizeStringArray(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}
