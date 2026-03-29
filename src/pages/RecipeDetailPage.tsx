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

const GALLERY_MOSAIC_TILES = [
  { id: 'mosaic-1', frameClass: 'col-span-2 row-span-2', imageClassName: 'scale-[1.04] object-[50%_48%]' },
  { id: 'mosaic-2', frameClass: 'col-span-1 row-span-1', imageClassName: 'scale-[1.14] object-[28%_40%]' },
  { id: 'mosaic-3', frameClass: 'col-span-1 row-span-1', imageClassName: 'scale-[1.16] object-[72%_42%]' },
  { id: 'mosaic-4', frameClass: 'col-span-2 row-span-1', imageClassName: 'scale-[1.08] object-[55%_62%]' },
  { id: 'mosaic-5', frameClass: 'col-span-1 row-span-2', imageClassName: 'scale-[1.18] object-[34%_58%]' },
  { id: 'mosaic-6', frameClass: 'col-span-1 row-span-1', imageClassName: 'scale-[1.12] object-[66%_54%]' },
  { id: 'mosaic-7', frameClass: 'col-span-2 row-span-1', imageClassName: 'scale-[1.1] object-[48%_70%]' },
  { id: 'mosaic-8', frameClass: 'col-span-1 row-span-1', imageClassName: 'scale-[1.18] object-[76%_64%]' },
  { id: 'mosaic-9', frameClass: 'col-span-1 row-span-1', imageClassName: 'scale-[1.1] object-[38%_30%]' },
  { id: 'mosaic-10', frameClass: 'col-span-2 row-span-2', imageClassName: 'scale-[1.16] object-[58%_52%]' },
] as const;

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
  const [expandedGalleryIndex, setExpandedGalleryIndex] = useState<number | null>(null);
  const galleryImageUrls =
    recipe?.image_urls.length
      ? recipe.image_urls
      : recipe?.image_url
        ? [recipe.image_url]
        : [];

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

  useEffect(() => {
    if (expandedGalleryIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedGalleryIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedGalleryIndex]);

  useEffect(() => {
    if (expandedGalleryIndex === null) {
      return;
    }

    if (!galleryImageUrls[expandedGalleryIndex]) {
      setExpandedGalleryIndex(null);
    }
  }, [expandedGalleryIndex, galleryImageUrls]);

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

          <div className="grid gap-7 pt-2 sm:grid-cols-2 sm:gap-10">
            <div className="relative space-y-3 pt-4">
              <div className="absolute left-0 top-0 h-px w-28 bg-[linear-gradient(90deg,rgba(242,143,52,0.85),rgba(255,255,255,0.06))]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-recipe-ink/58 dark:text-recipe-peel/62">
                Time
              </p>
              <div className="flex items-end gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-recipe-orange/10 text-recipe-orange ring-1 ring-recipe-orange/25 dark:bg-recipe-copper/12 dark:text-recipe-copper dark:ring-recipe-copper/24">
                  <ClockIcon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="font-display text-[2rem] leading-none text-recipe-ink dark:text-recipe-sand">
                    {getTotalTime(recipe)}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-recipe-ink/48 dark:text-recipe-sand/46">
                    Total time
                  </p>
                </div>
              </div>
              <p className="text-sm leading-7 text-recipe-ink/72 dark:text-recipe-sand/72">
                {formatPrepCook(recipe)}
              </p>
            </div>

            <div className="relative space-y-3 pt-4">
              <div className="absolute left-0 top-0 h-px w-28 bg-[linear-gradient(90deg,rgba(242,143,52,0.85),rgba(255,255,255,0.06))]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-recipe-ink/58 dark:text-recipe-peel/62">
                Servings
              </p>
              <div className="flex items-end gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-recipe-orange/10 text-recipe-orange ring-1 ring-recipe-orange/25 dark:bg-recipe-copper/12 dark:text-recipe-copper dark:ring-recipe-copper/24">
                  <BowlIcon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="font-display text-[2rem] leading-none text-recipe-ink dark:text-recipe-sand">
                    {recipe.servings || 'Flexible'}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-recipe-ink/48 dark:text-recipe-sand/46">
                    {recipe.servings ? 'Servings' : 'Serving size'}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-7 text-recipe-ink/72 dark:text-recipe-sand/72">
                {recipe.instructions.length} step{recipe.instructions.length === 1 ? '' : 's'} in the method
              </p>
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

        <div className="px-2 py-2 sm:px-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
            Instructions
          </p>
          <ol className="mt-5 space-y-6">
            {recipe.instructions.map((instruction, index) => (
              <li key={`${recipe.id}-instruction-${index}`}>
                <div className="flex gap-4">
                  <span className="flex w-8 shrink-0 justify-center font-display text-[2rem] leading-none text-recipe-orange/88 dark:text-recipe-copper/92">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-7 text-recipe-ink/78 dark:text-recipe-sand/76">{instruction}</p>
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

      {galleryImageUrls.length ? (
        <section className="relative mx-auto max-w-[1460px] pt-2">
          <div className="pointer-events-none absolute left-[12%] top-[22%] -z-10 h-52 w-52 rounded-full bg-recipe-orange/10 blur-3xl" />
          <div className="grid grid-cols-2 auto-rows-[120px] gap-2 sm:auto-rows-[150px] sm:gap-3 lg:grid-cols-4 xl:grid-cols-6 xl:auto-rows-[120px]">
            {galleryImageUrls.map((imageUrl, index) => {
              const tile = GALLERY_MOSAIC_TILES[index % GALLERY_MOSAIC_TILES.length];

              return (
                <button
                  key={`${tile.id}-${index}`}
                  type="button"
                  onClick={() => setExpandedGalleryIndex(index)}
                  className={`group relative overflow-hidden rounded-[24px] bg-[#1b100b]/20 ring-1 ring-white/8 transition duration-300 hover:ring-2 hover:ring-recipe-orange/75 hover:shadow-[0_0_0_1px_rgba(242,143,52,0.34),0_20px_40px_rgba(242,143,52,0.2)] ${tile.frameClass}`}
                  aria-label={`Expand recipe image ${index + 1}`}
                >
                  <RecipeImage
                    src={imageUrl}
                    alt={`${recipe.title} mosaic view ${index + 1}`}
                    className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.07] ${tile.imageClassName}`}
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_40%,rgba(17,10,7,0.22))] opacity-80 transition duration-300 group-hover:opacity-50" />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {galleryImageUrls.length && expandedGalleryIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,8,5,0.86)] px-4 py-6 backdrop-blur-md"
          onClick={() => setExpandedGalleryIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded recipe image"
        >
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setExpandedGalleryIndex(null)}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/18 bg-black/28 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition duration-300 hover:border-recipe-orange/65 hover:text-recipe-peel"
            >
              Close
            </button>
            <div className="overflow-hidden rounded-[30px] border border-white/12 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <RecipeImage
                src={galleryImageUrls[expandedGalleryIndex]}
                alt={`${recipe.title} expanded view ${expandedGalleryIndex + 1}`}
                className={`max-h-[82vh] w-full object-cover ${
                  GALLERY_MOSAIC_TILES[expandedGalleryIndex % GALLERY_MOSAIC_TILES.length].imageClassName
                }`}
                loading="eager"
              />
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
