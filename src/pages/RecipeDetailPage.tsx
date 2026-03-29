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

interface GallerySlide {
  id: string;
  title: string;
  caption: string;
  imageClassName: string;
}

function buildGallerySlides(recipe: Recipe | null): GallerySlide[] {
  if (!recipe) {
    return [];
  }

  if (!recipe.image_url) {
    return [
      {
        id: 'cover',
        title: 'Recipe cover',
        caption: 'Add more photos later to expand this gallery.',
        imageClassName: 'object-center',
      },
    ];
  }

  return [
    {
      id: 'cover',
      title: 'Hero plate',
      caption: 'The full dish in its main serving moment.',
      imageClassName: 'object-center',
    },
    {
      id: 'detail',
      title: 'Close detail',
      caption: 'A tighter crop for texture, color, and finish.',
      imageClassName: 'scale-110 object-[52%_52%]',
    },
    {
      id: 'plated',
      title: 'Table angle',
      caption: 'A warmer crop for the plated final look.',
      imageClassName: 'scale-[1.16] object-[58%_62%]',
    },
  ];
}

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
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const gallerySlides = buildGallerySlides(recipe);

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
    setActiveGalleryIndex(0);
  }, [recipe?.id]);

  useEffect(() => {
    if (gallerySlides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveGalleryIndex((currentIndex) => (currentIndex + 1) % gallerySlides.length);
    }, 3600);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [gallerySlides.length]);

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

      <section className="surface-panel px-5 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
              Gallery
            </p>
            <p className="mt-2 text-sm text-recipe-ink/68 dark:text-recipe-sand/70">
              A quick roulette of recipe visuals.
            </p>
          </div>
          {gallerySlides.length > 1 ? (
            <div className="flex items-center gap-2">
              {gallerySlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveGalleryIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === activeGalleryIndex
                      ? 'w-8 bg-recipe-orange'
                      : 'w-2.5 bg-recipe-ink/18 hover:bg-recipe-orange/45 dark:bg-recipe-sand/18'
                  }`}
                  aria-label={`Show ${slide.title}`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-5 overflow-hidden rounded-[30px] border border-white/10 bg-[#1b100b]/35">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeGalleryIndex * 100}%)` }}
          >
            {gallerySlides.map((slide) => (
              <div key={slide.id} className="relative w-full shrink-0">
                <RecipeImage
                  src={recipe.image_url}
                  alt={`${recipe.title} ${slide.title}`}
                  className={`aspect-[16/8.5] w-full object-cover transition duration-700 ${slide.imageClassName}`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/14 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/76">
                    {slide.title}
                  </p>
                  <p className="mt-2 text-sm text-white/82">{slide.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {gallerySlides.length > 1 ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {gallerySlides.map((slide, index) => (
              <button
                key={`${slide.id}-thumb`}
                type="button"
                onClick={() => setActiveGalleryIndex(index)}
                className={`group relative overflow-hidden rounded-[22px] border transition duration-300 ${
                  index === activeGalleryIndex
                    ? 'border-recipe-orange/60'
                    : 'border-white/10 hover:border-recipe-orange/35'
                }`}
              >
                <RecipeImage
                  src={recipe.image_url}
                  alt={`${recipe.title} ${slide.title} preview`}
                  className={`h-24 w-40 object-cover transition duration-500 group-hover:scale-105 ${slide.imageClassName}`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20" />
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </article>
  );
}
