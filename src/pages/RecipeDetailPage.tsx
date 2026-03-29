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
      <section className="grid gap-8 xl:grid-cols-[1fr_0.95fr] xl:items-start">
        <div className="overflow-hidden rounded-[36px] bg-recipe-cream shadow-soft">
          <RecipeImage
            src={recipe.image_url}
            alt={recipe.title}
            className="aspect-[4/3.8] w-full object-cover"
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
            <h1 className="font-display text-4xl leading-tight text-recipe-ink sm:text-5xl">
              {recipe.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-recipe-ink/72">
              {recipe.description || 'A personal classic worth keeping close at hand.'}
            </p>
            <p className="text-sm text-recipe-ink/50">Added {formatRecipeDate(recipe.created_at)}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] bg-white px-4 py-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-recipe-ink/45">
                Time
              </p>
              <div className="mt-3 space-y-2 text-sm text-recipe-ink/75">
                <p className="inline-flex items-center gap-2"><ClockIcon className="h-4 w-4" />{formatPrepCook(recipe)}</p>
                <p>{getTotalTime(recipe)} total</p>
              </div>
            </div>
            <div className="rounded-[28px] bg-white px-4 py-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-recipe-ink/45">
                Servings
              </p>
              <div className="mt-3 space-y-2 text-sm text-recipe-ink/75">
                <p className="inline-flex items-center gap-2"><BowlIcon className="h-4 w-4" />{recipe.servings || 'Flexible'}</p>
                <p>{recipe.instructions.length} steps</p>
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

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-panel px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
            Ingredients
          </p>
          <ul className="mt-4 space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={`${recipe.id}-ingredient-${index}`} className="flex gap-3 text-sm leading-7 text-recipe-ink/80">
                <span className="mt-[0.8rem] h-2 w-2 rounded-full bg-recipe-orange" />
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-panel px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
            Instructions
          </p>
          <ol className="mt-4 space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={`${recipe.id}-instruction-${index}`} className="rounded-[26px] bg-recipe-cream px-4 py-4">
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-display text-xl text-recipe-ember shadow-sm">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-recipe-ink/78">{instruction}</p>
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
          <p className="mt-4 max-w-3xl text-sm leading-8 text-recipe-ink/76">{recipe.notes}</p>
        </section>
      ) : null}
    </article>
  );
}
