import { useEffect, useState } from 'react';

import { getAllRecipes } from '../services/recipeService';
import type { Recipe } from '../types/recipe';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextRecipes = await getAllRecipes();
      setRecipes(nextRecipes);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : 'Unable to load recipes right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return {
    recipes,
    loading,
    error,
    refresh,
    setRecipes,
  };
}
