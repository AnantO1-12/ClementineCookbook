import { Link } from 'react-router-dom';

import type { Recipe } from '../types/recipe';
import { formatPrepCook, getTotalTime, sentenceCase } from '../utils/format';
import { RecipeImage } from './RecipeImage';
import { BowlIcon, ClockIcon, HeartIcon } from './ui/Icons';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      to={`/recipes/${recipe.slug}`}
      className="group overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft dark:border-recipe-clay/45 dark:bg-[#1e1510] dark:hover:border-recipe-orange/35"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <RecipeImage
          src={recipe.image_url}
          alt={recipe.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {recipe.category ? <span className="glass-chip">{sentenceCase(recipe.category)}</span> : null}
          <span className="glass-chip">{getTotalTime(recipe)} total</span>
        </div>

        {recipe.is_favorite ? (
          <div className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-recipe-ember shadow-md dark:bg-[#1a120d]/90 dark:text-recipe-copper dark:shadow-none">
            <HeartIcon className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="space-y-2">
          <h3 className="font-display text-2xl leading-tight text-recipe-ink transition group-hover:text-recipe-ember dark:text-recipe-sand dark:group-hover:text-recipe-copper">
            {recipe.title}
          </h3>
          <p className="truncate-2 text-sm leading-6 text-recipe-ink/72 dark:text-recipe-sand/68">
            {recipe.description || 'A polished favorite ready for your next dinner table.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-recipe-ink/55 dark:text-recipe-sand/52">
          <span className="inline-flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            {formatPrepCook(recipe)}
          </span>
          {recipe.servings ? (
            <span className="inline-flex items-center gap-2">
              <BowlIcon className="h-4 w-4" />
              {recipe.servings} servings
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
