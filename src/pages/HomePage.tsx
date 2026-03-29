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
    <div className="space-y-8">
      <section className="surface-panel grid gap-6 overflow-hidden px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-recipe-orange">
              Your kitchen notebook
            </p>
            <h1 className="max-w-2xl font-display text-4xl leading-tight text-recipe-ink sm:text-5xl lg:text-6xl">
              A calm, citrus-toned home for every recipe you actually cook.
            </h1>
            <p className="max-w-xl text-base leading-8 text-recipe-ink/70">
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

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[26px] bg-recipe-cream px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-recipe-ink/45">
                Recipes
              </p>
              <p className="mt-2 font-display text-3xl text-recipe-ink">{recipes.length}</p>
            </div>
            <div className="rounded-[26px] bg-recipe-cream px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-recipe-ink/45">
                Categories
              </p>
              <p className="mt-2 font-display text-3xl text-recipe-ink">{categories.length}</p>
            </div>
            <div className="rounded-[26px] bg-recipe-cream px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-recipe-ink/45">
                Favorites
              </p>
              <p className="mt-2 font-display text-3xl text-recipe-ink">{favoriteCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
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

        <div className="relative overflow-hidden rounded-[34px] bg-recipe-cream">
          <RecipeImage
            src={featuredRecipe?.image_url}
            alt={featuredRecipe?.title ?? 'Featured recipe preview'}
            className="aspect-[4/4.4] w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-recipe-ink/85 via-recipe-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 text-white sm:p-7">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              {featuredRecipe?.category ? <span>{sentenceCase(featuredRecipe.category)}</span> : null}
              {featuredRecipe?.cuisine ? <span>{sentenceCase(featuredRecipe.cuisine)}</span> : null}
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl">
                {featuredRecipe?.title ?? 'Your recipes will shine here'}
              </p>
              <p className="mt-2 max-w-md text-sm leading-7 text-white/82">
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
        </div>
      </section>

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      <section className="surface-panel space-y-5 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
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

          <label className="flex flex-col gap-2 text-sm font-semibold text-recipe-ink">
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

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
              Results
            </p>
            <h2 className="mt-1 font-display text-3xl text-recipe-ink">
              {filteredRecipes.length} recipe{filteredRecipes.length === 1 ? '' : 's'}
            </h2>
          </div>
          {isPending ? <p className="text-sm text-recipe-ink/55">Refreshing the grid…</p> : null}
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
