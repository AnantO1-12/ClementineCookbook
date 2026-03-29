import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RecipeForm } from '../components/RecipeForm';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { createRecipe, uploadRecipeImage } from '../services/recipeService';
import type { RecipeMutationInput } from '../types/recipe';

export function AddRecipePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleCreateRecipe = async (values: RecipeMutationInput, imageFile: File | null) => {
    if (!user) {
      showToast({
        title: 'You need to sign in',
        description: 'Only the admin account can create recipes.',
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

      const recipe = await createRecipe({ ...values, image_url: imageUrl }, user.id);

      showToast({
        title: 'Recipe saved',
        description: `${recipe.title} is now part of your cookbook.`,
        tone: 'success',
      });

      navigate(`/recipes/${recipe.slug}`);
    } catch (createError) {
      showToast({
        title: 'Could not save recipe',
        description: createError instanceof Error ? createError.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-3 px-5 py-6 sm:px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-recipe-orange">
          Add recipe
        </p>
        <h1 className="font-display text-4xl text-recipe-ink sm:text-5xl">
          Capture a dish before it slips away.
        </h1>
        <p className="max-w-2xl text-base leading-8 text-recipe-ink/70">
          Keep it simple: title, timings, ingredients, instructions, and an image that makes the shelf feel alive.
        </p>
      </section>

      <RecipeForm mode="create" submitting={submitting} onSubmit={handleCreateRecipe} />
    </div>
  );
}
