import { useState, useTransition } from 'react';
import { Link } from 'react-router-dom';

import { CategoryFilter } from '../components/CategoryFilter';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeImage } from '../components/RecipeImage';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import { formatPrepCook, getTotalTime, sentenceCase } from '../utils/format';
import { ArrowRightIcon, PlusIcon } from '../components/ui/Icons';

export function HomePage() {
  const { recipes, loading, error, refresh } = useRecipes();
  const { isAuthenticated } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isPending, startTransition] = useTransition();

  const categories = Array.from(
    new Set(
      recipes
        .map((recipe) => recipe.category?.trim())
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort((left, right) => left.localeCompare(right));

  const normalizedSearch = searchValue.trim().toLowerCase();
  const searchTerms = normalizedSearch.split(/\s+/).filter(Boolean);

  const categoryScopedRecipes = recipes.filter((recipe) => {
    return selectedCategory === 'All'
      ? true
      : selectedCategory === 'Favorites'
        ? recipe.is_favorite
        : recipe.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const filteredRecipes = categoryScopedRecipes
    .filter((recipe) => {
      if (!searchTerms.length) {
        return true;
      }

      const searchableText = [recipe.title, ...recipe.ingredients].join(' ').toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    })
    .sort((left, right) => {
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    });

  const searchSuggestions = searchTerms.length
    ? filteredRecipes.slice(0, 5).map((recipe) => {
        const matchedIngredient = recipe.ingredients.find((ingredient) =>
          searchTerms.some((term) => ingredient.toLowerCase().includes(term)),
        );

        return {
          id: recipe.id,
          title: recipe.title,
          slug: recipe.slug,
          detail: matchedIngredient
            ? `Ingredient match: ${matchedIngredient}`
            : recipe.category
              ? sentenceCase(recipe.category)
              : undefined,
        };
      })
    : [];

  const featuredRecipe = filteredRecipes[0] ?? recipes[0] ?? null;
  const favoriteCount = recipes.filter((recipe) => recipe.is_favorite).length;

  return (
    <div className="space-y-10 xl:space-y-14">
      <section className="relative isolate mx-auto max-w-[1360px] overflow-hidden rounded-[38px] border border-white/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(255,246,234,0.9)_38%,rgba(255,223,185,0.78)_100%)] px-4 py-4 shadow-soft dark:border-recipe-clay/45 dark:bg-[linear-gradient(145deg,rgba(31,18,12,0.95)_0%,rgba(47,24,15,0.93)_40%,rgba(92,41,18,0.84)_100%)] sm:px-6 sm:py-5 lg:grid lg:grid-cols-[0.78fr_1.12fr] lg:items-start lg:gap-6 xl:px-7 xl:py-5 2xl:max-w-[1400px] 2xl:grid-cols-[0.75fr_1.1fr]">
        <div className="pointer-events-none absolute -left-10 top-4 h-48 w-48 rounded-full bg-white/45 blur-3xl animate-drift dark:bg-recipe-copper/10" />
        <div className="pointer-events-none absolute left-[42%] top-[58%] h-44 w-44 rounded-full bg-recipe-orange/15 blur-3xl animate-pulse-glow dark:bg-recipe-orange/18" />
        <div className="pointer-events-none absolute -right-12 top-12 h-64 w-64 rounded-full bg-recipe-marmalade/20 blur-3xl animate-drift-reverse dark:bg-recipe-copper/18" />

        <div className="relative z-10 flex flex-col gap-4 lg:h-full lg:justify-between lg:py-1 xl:pr-2">
          <div
            className="animate-rise flex items-center gap-4 sm:gap-5"
            style={{ animationDelay: '70ms' }}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/72 shadow-[0_18px_40px_rgba(108,46,16,0.18)] ring-1 ring-white/25 dark:border-recipe-clay/50 dark:bg-[#271711]/92 dark:ring-recipe-copper/20 sm:h-16 sm:w-16">
              <img
                src="/clementine-slice-logo.png"
                alt="Clementine orange slice logo"
                className="citrus-logo h-10 w-10 object-contain sm:h-12 sm:w-12"
              />
            </span>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-recipe-burnt dark:text-recipe-peel sm:text-xs">
                Clementine Notebook
              </p>
              <p className="max-w-[19rem] text-sm leading-6 text-recipe-burnt/68 dark:text-recipe-copper/88">
                A softer rhythm for recipes you actually make.
              </p>
            </div>
          </div>
          <SearchBar
            value={searchValue}
            onChange={(nextValue) => {
              startTransition(() => {
                setSearchValue(nextValue);
              });
            }}
            isPending={isPending}
            size="hero"
            suggestions={searchSuggestions}
          />

          <section className="animate-rise space-y-3.5 pt-0.5" style={{ animationDelay: '220ms' }}>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-burnt dark:text-recipe-peel">
                Explore the shelf
              </p>
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                includeFavorites
                onSelect={(category) => {
                  startTransition(() => {
                    setSelectedCategory(category);
                  });
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="min-w-[84px] rounded-[22px] border border-white/38 bg-white/12 px-2.5 py-1.5 shadow-sm backdrop-blur-md dark:border-recipe-clay/28 dark:bg-[#20130e]/24">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-recipe-ink/45 dark:text-recipe-sand/45">
                  Recipes
                </p>
                <p className="mt-0.5 font-display text-[1.55rem] leading-none text-recipe-ink dark:text-recipe-sand">
                  {recipes.length}
                </p>
              </div>
              <div className="min-w-[84px] rounded-[22px] border border-white/38 bg-white/12 px-2.5 py-1.5 shadow-sm backdrop-blur-md dark:border-recipe-clay/28 dark:bg-[#20130e]/24">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-recipe-ink/45 dark:text-recipe-sand/45">
                  Categories
                </p>
                <p className="mt-0.5 font-display text-[1.55rem] leading-none text-recipe-ink dark:text-recipe-sand">
                  {categories.length}
                </p>
              </div>
              <div className="min-w-[84px] rounded-[22px] border border-white/38 bg-white/12 px-2.5 py-1.5 shadow-sm backdrop-blur-md dark:border-recipe-clay/28 dark:bg-[#20130e]/24">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-recipe-ink/45 dark:text-recipe-sand/45">
                  Favorites
                </p>
                <p className="mt-0.5 font-display text-[1.55rem] leading-none text-recipe-ink dark:text-recipe-sand">
                  {favoriteCount}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-0.5">
              <Link to={featuredRecipe ? `/recipes/${featuredRecipe.slug}` : '/'} className="btn-primary">
                <span>{featuredRecipe ? 'Open featured recipe' : 'Start browsing'}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              {isAuthenticated ? (
                <Link to="/recipes/new" className="btn-secondary">
                  <PlusIcon className="h-4 w-4" />
                  <span>Add recipe</span>
                </Link>
              ) : null}
            </div>
          </section>
        </div>

        <div className="relative z-10 mt-4 overflow-hidden rounded-[30px] border border-white/45 bg-white/12 shadow-[0_18px_38px_rgba(89,42,16,0.15)] backdrop-blur-xl dark:border-recipe-clay/40 dark:bg-[#1d120d]/22 lg:mt-0 lg:w-full lg:max-w-[620px] lg:justify-self-end xl:max-w-[680px] 2xl:max-w-[710px] animate-rise" style={{ animationDelay: '140ms' }}>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-recipe-peel via-recipe-orange to-recipe-ember" />
          <RecipeImage
            src={featuredRecipe?.image_url}
            alt={featuredRecipe?.title ?? 'Featured recipe preview'}
            className="aspect-[4/3] w-full object-cover transition duration-700 sm:aspect-[16/11] lg:aspect-[16/11] 2xl:aspect-[1.55/1]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-recipe-night/90 via-recipe-burnt/18 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-4 text-white sm:p-5 xl:p-6">
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
              {featuredRecipe?.category ? <span>{sentenceCase(featuredRecipe.category)}</span> : null}
              {featuredRecipe?.cuisine ? <span>{sentenceCase(featuredRecipe.cuisine)}</span> : null}
            </div>
            <div>
              <p className="font-display text-[1.7rem] sm:text-[2rem] xl:text-[2.1rem]">
                {featuredRecipe?.title ?? 'Your recipes will shine here'}
              </p>
              <p className="mt-1 max-w-xl text-[13px] leading-5 text-white/82 xl:text-[0.9rem]">
                {featuredRecipe?.description ||
                  'Seed the database and the home page will spotlight one of your dishes here.'}
              </p>
            </div>
            {featuredRecipe ? (
              <div className="flex flex-wrap gap-2.5 text-[12px] text-white/85">
                <span>{formatPrepCook(featuredRecipe)}</span>
                <span>{getTotalTime(featuredRecipe)} total</span>
                {featuredRecipe.servings ? <span>{featuredRecipe.servings} servings</span> : null}
              </div>
            ) : null}
          </div>

          {featuredRecipe ? (
            <div className="absolute bottom-3 right-3 hidden rounded-[22px] border border-white/20 bg-[#fff4e6]/92 px-3 py-2 shadow-[0_16px_32px_rgba(78,31,9,0.2)] backdrop-blur xl:block dark:border-white/10 dark:bg-[#1b120e]/88">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-recipe-burnt/70 dark:text-recipe-peel/70">
                Tonight's pull
              </p>
              <p className="mt-1 font-display text-base text-recipe-burnt dark:text-recipe-peel">
                {featuredRecipe.category ? sentenceCase(featuredRecipe.category) : 'Featured'}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      <section className="mx-auto max-w-[1360px] space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-burnt dark:text-recipe-peel">
              Results
            </p>
          </div>
          {isPending ? (
            <p className="text-sm text-recipe-ink/55 dark:text-recipe-sand/55">Refreshing the grid…</p>
          ) : null}
        </div>

        {loading ? <LoadingSpinner label="Setting the table..." /> : null}

        {!loading && !error && !filteredRecipes.length ? (
          <EmptyState
            title="No recipes match this filter"
            description="Try another category, clear the search, or add a new recipe to start building out the shelf."
            action={
              isAuthenticated ? (
                <Link to="/recipes/new" className="btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  <span>Add recipe</span>
                </Link>
              ) : undefined
            }
          />
        ) : null}

        {!loading && filteredRecipes.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
