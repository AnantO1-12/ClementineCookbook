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
      className="group relative overflow-hidden rounded-[30px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,244,231,0.92)_100%)] shadow-card transition duration-500 hover:-translate-y-1.5 hover:rotate-[0.25deg] hover:shadow-soft dark:border-recipe-clay/45 dark:bg-[linear-gradient(180deg,rgba(31,20,15,0.98)_0%,rgba(44,26,17,0.94)_100%)] dark:hover:border-recipe-orange/35"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <RecipeImage
          src={recipe.image_url}
          alt={recipe.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/0 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {recipe.category ? <span className="glass-chip">{sentenceCase(recipe.category)}</span> : null}
          <span className="glass-chip">{getTotalTime(recipe)} total</span>
        </div>

        {recipe.is_favorite ? (
          <div className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-recipe-ember shadow-md dark:bg-[#1a120d]/90 dark:text-recipe-copper dark:shadow-none">
            <HeartIcon className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      <div className="space-y-3 px-5 py-4">
        <div className="space-y-1.5">
          <h3 className="font-display text-[1.9rem] leading-tight text-recipe-ink transition group-hover:text-recipe-ember dark:text-recipe-sand dark:group-hover:text-recipe-copper">
            {recipe.title}
          </h3>
          <p className="truncate-2 text-sm leading-5 text-recipe-ink/72 dark:text-recipe-sand/68">
            {recipe.description || 'A polished favorite ready for your next dinner table.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-recipe-ink/55 dark:text-recipe-sand/52">
          <span className="inline-flex items-center gap-2">
            <ClockIcon className="h-3.5 w-3.5" />
            {formatPrepCook(recipe)}
          </span>
          {recipe.servings ? (
            <span className="inline-flex items-center gap-2">
              <BowlIcon className="h-3.5 w-3.5" />
              {recipe.servings} servings
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
