import { useDeferredValue, useState, useTransition } from 'react';
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
import type { RecipeSort } from '../types/recipe';
import { formatPrepCook, getTotalTime, sentenceCase } from '../utils/format';
import { ArrowRightIcon, PlusIcon } from '../components/ui/Icons';

export function HomePage() {
  const { recipes, loading, error, refresh } = useRecipes();
  const { isAuthenticated } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<RecipeSort>('newest');
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(searchValue);

  const categories = Array.from(
    new Set(
      recipes
        .map((recipe) => recipe.category?.trim())
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort((left, right) => left.localeCompare(right));

  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filteredRecipes = recipes
    .filter((recipe) => {
      const haystack = [recipe.title, recipe.category, recipe.cuisine, recipe.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === 'All' || recipe.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((left, right) => {
      if (sortBy === 'alphabetical') {
        return left.title.localeCompare(right.title);
      }

      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    });

  const featuredRecipe = filteredRecipes[0] ?? recipes[0] ?? null;
  const favoriteCount = recipes.filter((recipe) => recipe.is_favorite).length;

  return (
    <div className="space-y-10 xl:space-y-14">
      <section className="relative isolate overflow-hidden rounded-[46px] border border-white/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(255,246,234,0.9)_38%,rgba(255,223,185,0.78)_100%)] px-5 py-6 shadow-soft dark:border-recipe-clay/45 dark:bg-[linear-gradient(145deg,rgba(31,18,12,0.95)_0%,rgba(47,24,15,0.93)_40%,rgba(92,41,18,0.84)_100%)] sm:px-7 sm:py-8 lg:grid lg:grid-cols-[0.98fr_1.02fr] lg:items-center xl:px-12 xl:py-12 2xl:grid-cols-[0.86fr_1.14fr]">
        <div className="pointer-events-none absolute -left-10 top-4 h-48 w-48 rounded-full bg-white/45 blur-3xl animate-drift dark:bg-recipe-copper/10" />
        <div className="pointer-events-none absolute left-[42%] top-[58%] h-44 w-44 rounded-full bg-recipe-orange/15 blur-3xl animate-pulse-glow dark:bg-recipe-orange/18" />
        <div className="pointer-events-none absolute -right-12 top-12 h-64 w-64 rounded-full bg-recipe-marmalade/20 blur-3xl animate-drift-reverse dark:bg-recipe-copper/18" />

        <div className="relative z-10 space-y-8 xl:pr-8">
          <div className="flex items-center gap-4 animate-rise">
            <img
              src="/clementine-slice-logo.png"
              alt="Clementine orange slice logo"
              className="citrus-logo h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-recipe-burnt dark:text-recipe-peel">
                Clementine notebook
              </p>
              <p className="text-sm leading-6 text-recipe-burnt/75 dark:text-recipe-sand/72">
                A softer rhythm for recipes you actually make.
              </p>
            </div>
          </div>

          <div className="space-y-4 animate-rise" style={{ animationDelay: '90ms' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-recipe-orange">
              Your kitchen notebook
            </p>
            <h1 className="max-w-3xl font-display text-4xl leading-[0.96] text-recipe-ink dark:text-recipe-sand sm:text-5xl xl:text-[4.25rem] 2xl:text-[4.9rem]">
              A calm, citrus-toned home for every recipe you actually cook.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-recipe-ink/70 dark:text-recipe-sand/70 xl:text-lg">
              Browse favorites, search by category or cuisine, and keep your personal cookbook
              polished enough to feel special every time you open it.
            </p>
          </div>

          <SearchBar
            value={searchValue}
            onChange={(nextValue) => {
              startTransition(() => {
                setSearchValue(nextValue);
              });
            }}
            isPending={isPending}
          />

          <div className="flex flex-wrap gap-3 animate-rise" style={{ animationDelay: '160ms' }}>
            <div className="min-w-[140px] rounded-full border border-white/65 bg-white/62 px-5 py-3 shadow-sm backdrop-blur dark:border-recipe-clay/45 dark:bg-[#20130e]/62">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-recipe-ink/45 dark:text-recipe-sand/45">
                Recipes
              </p>
              <p className="mt-1 font-display text-3xl text-recipe-ink dark:text-recipe-sand">
                {recipes.length}
              </p>
            </div>
            <div className="min-w-[140px] rounded-full border border-white/65 bg-white/62 px-5 py-3 shadow-sm backdrop-blur dark:border-recipe-clay/45 dark:bg-[#20130e]/62">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-recipe-ink/45 dark:text-recipe-sand/45">
                Categories
              </p>
              <p className="mt-1 font-display text-3xl text-recipe-ink dark:text-recipe-sand">
                {categories.length}
              </p>
            </div>
            <div className="min-w-[140px] rounded-full border border-white/65 bg-white/62 px-5 py-3 shadow-sm backdrop-blur dark:border-recipe-clay/45 dark:bg-[#20130e]/62">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-recipe-ink/45 dark:text-recipe-sand/45">
                Favorites
              </p>
              <p className="mt-1 font-display text-3xl text-recipe-ink dark:text-recipe-sand">
                {favoriteCount}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 animate-rise" style={{ animationDelay: '220ms' }}>
            <Link to={featuredRecipe ? `/recipes/${featuredRecipe.slug}` : '/'} className="btn-primary">
              <span>{featuredRecipe ? 'Open featured recipe' : 'Start browsing'}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            {isAuthenticated ? (
              <Link to="/recipes/new" className="btn-secondary">
                <PlusIcon className="h-4 w-4" />
                <span>Add recipe</span>
              </Link>
            ) : (
              <Link to="/login" className="btn-secondary">
                <span>Admin login</span>
              </Link>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-8 overflow-hidden rounded-[38px] border border-white/50 bg-white/12 shadow-[0_24px_50px_rgba(89,42,16,0.18)] backdrop-blur-xl dark:border-recipe-clay/45 dark:bg-[#1d120d]/25 lg:mt-0 lg:-mr-3 xl:-mr-5 animate-rise" style={{ animationDelay: '140ms' }}>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-recipe-peel via-recipe-orange to-recipe-ember" />
          <RecipeImage
            src={featuredRecipe?.image_url}
            alt={featuredRecipe?.title ?? 'Featured recipe preview'}
            className="aspect-[4/3] w-full object-cover transition duration-700 sm:aspect-[16/11] lg:aspect-[6/7] 2xl:aspect-[16/15]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-recipe-night/90 via-recipe-burnt/18 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 text-white sm:p-7 xl:p-8">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              {featuredRecipe?.category ? <span>{sentenceCase(featuredRecipe.category)}</span> : null}
              {featuredRecipe?.cuisine ? <span>{sentenceCase(featuredRecipe.cuisine)}</span> : null}
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl xl:text-[2.75rem]">
                {featuredRecipe?.title ?? 'Your recipes will shine here'}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-7 text-white/82 xl:text-base">
                {featuredRecipe?.description ||
                  'Seed the database and the home page will spotlight one of your dishes here.'}
              </p>
            </div>
            {featuredRecipe ? (
              <div className="flex flex-wrap gap-4 text-sm text-white/85">
                <span>{formatPrepCook(featuredRecipe)}</span>
                <span>{getTotalTime(featuredRecipe)} total</span>
                {featuredRecipe.servings ? <span>{featuredRecipe.servings} servings</span> : null}
              </div>
            ) : null}
          </div>

          {featuredRecipe ? (
            <div className="absolute -bottom-3 right-5 hidden rounded-[28px] border border-white/20 bg-[#fff4e6]/92 px-4 py-3 shadow-[0_16px_32px_rgba(78,31,9,0.2)] backdrop-blur xl:block dark:border-white/10 dark:bg-[#1b120e]/88">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-recipe-burnt/70 dark:text-recipe-peel/70">
                Tonight's pull
              </p>
              <p className="mt-1 font-display text-xl text-recipe-burnt dark:text-recipe-peel">
                {featuredRecipe.category ? sentenceCase(featuredRecipe.category) : 'Featured'}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      <section className="flow-band animate-rise" style={{ animationDelay: '180ms' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-burnt dark:text-recipe-peel">
              Explore the shelf
            </p>
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={(category) => {
                startTransition(() => {
                  setSelectedCategory(category);
                });
              }}
            />
          </div>

          <label className="flex flex-col gap-2 text-sm font-semibold text-recipe-ink dark:text-recipe-sand">
            Sort recipes
            <select
              value={sortBy}
              onChange={(event) => {
                startTransition(() => {
                  setSortBy(event.target.value as RecipeSort);
                });
              }}
              className="field-input min-w-[220px]"
            >
              <option value="newest">Newest first</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-burnt dark:text-recipe-peel">
              Results
            </p>
            <h2 className="mt-1 font-display text-3xl text-recipe-ink dark:text-recipe-sand">
              {filteredRecipes.length} recipe{filteredRecipes.length === 1 ? '' : 's'}
            </h2>
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
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
