import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { RecipeForm } from '../components/RecipeForm';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getRecipeBySlug, updateRecipe, uploadRecipeImage } from '../services/recipeService';
import type { Recipe, RecipeFormValues, RecipeMutationInput } from '../types/recipe';

function buildInitialValues(recipe: Recipe): RecipeFormValues {
  return {
    title: recipe.title,
    description: recipe.description ?? '',
    category: recipe.category ?? '',
    cuisine: recipe.cuisine ?? '',
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    servings: recipe.servings,
    ingredients: recipe.ingredients.length ? recipe.ingredients : [''],
    instructions: recipe.instructions.length ? recipe.instructions : [''],
    notes: recipe.notes ?? '',
    image_url: recipe.image_url ?? '',
    is_favorite: recipe.is_favorite,
  };
}

export function EditRecipePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [initialValues, setInitialValues] = useState<RecipeFormValues | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setInitialValues(undefined);
      } else {
        setRecipe(nextRecipe);
        setInitialValues(buildInitialValues(nextRecipe));
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load this recipe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecipe();
  }, [slug]);

  const handleUpdateRecipe = async (values: RecipeMutationInput, imageFile: File | null) => {
    if (!recipe) {
      return;
    }

    if (!user) {
      showToast({
        title: 'You need to sign in',
        description: 'Only the admin account can update recipes.',
        tone: 'error',
      });
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = values.image_url;

      if (imageFile) {
        imageUrl = await uploadRecipeImage(imageFile, user.id, values.title);
      }

      const updatedRecipe = await updateRecipe(recipe.id, {
        ...values,
        image_url: imageUrl,
      });

      setRecipe(updatedRecipe);
      setInitialValues(buildInitialValues(updatedRecipe));

      showToast({
        title: 'Recipe updated',
        description: `${updatedRecipe.title} now reflects your latest edits.`,
        tone: 'success',
      });

      navigate(`/recipes/${updatedRecipe.slug}`);
    } catch (updateError) {
      showToast({
        title: 'Could not update recipe',
        description: updateError instanceof Error ? updateError.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Opening the recipe editor..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadRecipe} />;
  }

  if (!recipe || !initialValues) {
    return <ErrorState message="This recipe could not be found for editing." onRetry={loadRecipe} />;
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-3 px-5 py-6 sm:px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-recipe-orange">
          Edit recipe
        </p>
        <h1 className="font-display text-4xl text-recipe-ink sm:text-5xl">
          Tune the details and keep the shelf sharp.
        </h1>
        <p className="max-w-2xl text-base leading-8 text-recipe-ink/70">
          Refresh timings, adjust notes, or swap the cover image without losing the calm structure of the recipe page.
        </p>
      </section>

      <RecipeForm
        mode="edit"
        initialValues={initialValues}
        submitting={submitting}
        onSubmit={handleUpdateRecipe}
      />
    </div>
  );
}
