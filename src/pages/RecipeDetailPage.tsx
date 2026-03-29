import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { RecipeImage } from '../components/RecipeImage';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { deleteRecipe, getRecipeBySlug, toggleFavorite } from '../services/recipeService';
import type { Recipe } from '../types/recipe';
import { formatPrepCook, formatRecipeDate, getTotalTime, sentenceCase } from '../utils/format';
import { BowlIcon, ClockIcon, HeartIcon, PencilIcon, TrashIcon } from '../components/ui/Icons';

export function RecipeDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!slug) {
        setError('The recipe slug is missing from the URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextRecipe = await getRecipeBySlug(slug);

        if (!nextRecipe) {
          setRecipe(null);
        } else {
          setRecipe(nextRecipe);
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load this recipe.');
      } finally {
        setLoading(false);
      }
    };

    void loadRecipe();
  }, [slug]);

  const handleDelete = async () => {
    if (!recipe) {
      return;
    }

    const confirmed = window.confirm(`Delete ${recipe.title}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteRecipe(recipe.id);
      showToast({
        title: 'Recipe deleted',
        description: `${recipe.title} has been removed from your cookbook.`,
        tone: 'success',
      });
      navigate('/');
    } catch (deleteError) {
      showToast({
        title: 'Could not delete recipe',
        description: deleteError instanceof Error ? deleteError.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) {
      return;
    }

    setIsTogglingFavorite(true);

    try {
      const updatedRecipe = await toggleFavorite(recipe.id, !recipe.is_favorite);
      setRecipe(updatedRecipe);
      showToast({
        title: updatedRecipe.is_favorite ? 'Marked as favorite' : 'Removed from favorites',
        description: updatedRecipe.title,
        tone: 'success',
      });
    } catch (toggleError) {
      showToast({
        title: 'Favorite update failed',
        description: toggleError instanceof Error ? toggleError.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Plating the recipe..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!recipe) {
    return (
      <EmptyState
        title="Recipe not found"
        description="This dish may have been renamed or removed. Head back to the cookbook shelf to keep exploring."
        action={<Link to="/" className="btn-primary">Back to recipes</Link>}
      />
    );
  }

  return (
    <article className="space-y-8">
      <section className="grid gap-8 xl:grid-cols-[minmax(240px,0.58fr)_minmax(0,1.42fr)] xl:items-start xl:gap-10">
        <div className="overflow-hidden rounded-[32px] bg-recipe-cream shadow-soft dark:bg-[#2b1c16] xl:max-w-[460px]">
          <RecipeImage
            src={recipe.image_url}
            alt={recipe.title}
            className="aspect-[1/1.02] w-full object-cover"
            loading="eager"
          />
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {recipe.category ? <span className="pill-active">{sentenceCase(recipe.category)}</span> : null}
            {recipe.cuisine ? <span className="pill-button">{sentenceCase(recipe.cuisine)}</span> : null}
            {recipe.is_favorite ? <span className="pill-button">Favorite</span> : null}
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl leading-tight text-recipe-ink dark:text-recipe-sand sm:text-5xl">
              {recipe.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-recipe-ink/72 dark:text-recipe-sand/70">
              {recipe.description || 'A personal classic worth keeping close at hand.'}
            </p>
            <p className="text-sm text-recipe-ink/50 dark:text-recipe-sand/50">
              Added {formatRecipeDate(recipe.created_at)}
            </p>
          </div>

          <div className="grid gap-5 border-t border-white/8 pt-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-recipe-ink/58 dark:text-recipe-peel/62">
                Time
              </p>
              <div className="space-y-2 text-sm text-recipe-ink/82 dark:text-recipe-sand/84">
                <p className="inline-flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-recipe-orange dark:text-recipe-copper" />
                  <span>{formatPrepCook(recipe)}</span>
                </p>
                <p className="pl-6 text-recipe-ink/68 dark:text-recipe-sand/70">{getTotalTime(recipe)} total</p>
              </div>
            </div>
            <div className="space-y-2 sm:border-l sm:border-white/8 sm:pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-recipe-ink/58 dark:text-recipe-peel/62">
                Servings
              </p>
              <div className="space-y-2 text-sm text-recipe-ink/82 dark:text-recipe-sand/84">
                <p className="inline-flex items-center gap-2">
                  <BowlIcon className="h-4 w-4 text-recipe-orange dark:text-recipe-copper" />
                  <span>{recipe.servings || 'Flexible'}</span>
                </p>
                <p className="pl-6 text-recipe-ink/68 dark:text-recipe-sand/70">{recipe.instructions.length} steps</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isAuthenticated ? (
              <>
                <button type="button" onClick={handleToggleFavorite} className="btn-secondary" disabled={isTogglingFavorite}>
                  <HeartIcon className="h-4 w-4" />
                  <span>{isTogglingFavorite ? 'Updating…' : recipe.is_favorite ? 'Unfavorite' : 'Favorite'}</span>
                </button>
                <Link to={`/recipes/${recipe.slug}/edit`} className="btn-secondary">
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit recipe</span>
                </Link>
                <button type="button" onClick={handleDelete} className="btn-ghost text-rose-600" disabled={isDeleting}>
                  <TrashIcon className="h-4 w-4" />
                  <span>{isDeleting ? 'Deleting…' : 'Delete'}</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="surface-panel px-5 py-6 sm:px-6 dark:bg-[linear-gradient(160deg,rgba(39,22,15,0.98)_0%,rgba(49,27,17,0.96)_52%,rgba(70,34,19,0.9)_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
            Ingredients
          </p>
          <ul className="mt-4 space-y-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={`${recipe.id}-ingredient-${index}`}
                className="flex gap-4 text-base leading-8 text-recipe-burnt dark:text-[#fff2e2]"
              >
                <span className="mt-[0.9rem] h-2.5 w-2.5 rounded-full bg-recipe-orange shadow-[0_0_0_6px_rgba(242,143,52,0.14)]" />
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-panel px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
            Instructions
          </p>
          <ol className="mt-4 space-y-5">
            {recipe.instructions.map((instruction, index) => (
              <li key={`${recipe.id}-instruction-${index}`} className="border-b border-white/8 pb-5 last:border-b-0 last:pb-0">
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 font-display text-xl text-recipe-ember shadow-sm dark:border-white/8 dark:bg-[#1c130e]/45 dark:text-recipe-copper dark:shadow-none">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-recipe-ink/78 dark:text-recipe-sand/76">{instruction}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {recipe.notes ? (
        <section className="surface-panel px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
            Notes
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-recipe-ink/76 dark:text-recipe-sand/74">
            {recipe.notes}
          </p>
        </section>
      ) : null}
    </article>
  );
}
