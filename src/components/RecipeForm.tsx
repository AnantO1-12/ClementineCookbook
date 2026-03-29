import { useEffect, useState, type FormEvent } from 'react';

import type { FormErrors, RecipeFormValues, RecipeMutationInput } from '../types/recipe';
import { normalizeStringArray } from '../utils/format';
import { RecipeImage } from './RecipeImage';
import { PlusIcon, TrashIcon, UploadIcon } from './ui/Icons';

type ListField = 'ingredients' | 'instructions';
type ImageMode = 'url' | 'upload';

const DEFAULT_VALUES: RecipeFormValues = {
  title: '',
  description: '',
  category: '',
  cuisine: '',
  prep_time: 15,
  cook_time: 20,
  servings: 2,
  ingredients: [''],
  instructions: [''],
  notes: '',
  image_url: '',
  is_favorite: false,
};

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialValues?: RecipeFormValues;
  submitting?: boolean;
  onSubmit: (values: RecipeMutationInput, imageFile: File | null) => Promise<void>;
}

export function RecipeForm({
  mode,
  initialValues,
  submitting = false,
  onSubmit,
}: RecipeFormProps) {
  const [values, setValues] = useState<RecipeFormValues>(initialValues ?? DEFAULT_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageMode, setImageMode] = useState<ImageMode>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    setValues(initialValues ?? DEFAULT_VALUES);
    setImageMode('url');
    setImageFile(null);
    setErrors({});
  }, [initialValues]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(values.image_url);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile, values.image_url]);

  const updateValue = <FieldName extends keyof RecipeFormValues>(
    field: FieldName,
    nextValue: RecipeFormValues[FieldName],
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: nextValue,
    }));
  };

  const updateListValue = (field: ListField, index: number, nextValue: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: currentValues[field].map((item, itemIndex) =>
        itemIndex === index ? nextValue : item,
      ),
    }));
  };

  const addListItem = (field: ListField) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: [...currentValues[field], ''],
    }));
  };

  const removeListItem = (field: ListField, index: number) => {
    setValues((currentValues) => {
      const nextItems = currentValues[field].filter((_, itemIndex) => itemIndex !== index);

      return {
        ...currentValues,
        [field]: nextItems.length ? nextItems : [''],
      };
    });
  };

  const updateNumberValue = (
    field: 'prep_time' | 'cook_time' | 'servings',
    rawValue: string,
  ) => {
    const nextValue = rawValue === '' ? null : Number(rawValue);
    updateValue(field, Number.isNaN(nextValue) ? null : nextValue);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = 'A recipe title helps the cookbook stay scannable.';
    }

    if (!values.category.trim()) {
      nextErrors.category = 'Choose a category so filters stay useful.';
    }

    const normalizedIngredients = normalizeStringArray(values.ingredients);
    const normalizedInstructions = normalizeStringArray(values.instructions);

    if (!normalizedIngredients.length) {
      nextErrors.ingredients = 'Add at least one ingredient.';
    }

    if (!normalizedInstructions.length) {
      nextErrors.instructions = 'Add at least one instruction step.';
    }

    if (values.servings !== null && values.servings <= 0) {
      nextErrors.servings = 'Servings should be at least 1.';
    }

    if (values.prep_time !== null && values.prep_time < 0) {
      nextErrors.prep_time = 'Prep time cannot be negative.';
    }

    if (values.cook_time !== null && values.cook_time < 0) {
      nextErrors.cook_time = 'Cook time cannot be negative.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(
      {
        title: values.title.trim(),
        description: values.description.trim() || null,
        category: values.category.trim() || null,
        cuisine: values.cuisine.trim() || null,
        prep_time: values.prep_time,
        cook_time: values.cook_time,
        servings: values.servings,
        ingredients: normalizeStringArray(values.ingredients),
        instructions: normalizeStringArray(values.instructions),
        notes: values.notes.trim() || null,
        image_url: values.image_url.trim() || null,
        is_favorite: values.is_favorite,
      },
      imageMode === 'upload' ? imageFile : null,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
      <div className="surface-panel space-y-8 px-5 py-6 sm:px-7 sm:py-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="field-label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              value={values.title}
              onChange={(event) => updateValue('title', event.target.value)}
              className="field-input"
              placeholder="Sticky orange chicken with charred scallions"
            />
            {errors.title ? <p className="field-error">{errors.title}</p> : null}
          </div>

          <div className="md:col-span-2">
            <label className="field-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={values.description}
              onChange={(event) => updateValue('description', event.target.value)}
              className="textarea-field"
              rows={3}
              placeholder="A bright, cozy weeknight dinner with crisp citrus edges."
            />
          </div>

          <div>
            <label className="field-label" htmlFor="category">
              Category
            </label>
            <input
              id="category"
              value={values.category}
              onChange={(event) => updateValue('category', event.target.value)}
              className="field-input"
              placeholder="Dinner"
            />
            {errors.category ? <p className="field-error">{errors.category}</p> : null}
          </div>

          <div>
            <label className="field-label" htmlFor="cuisine">
              Cuisine
            </label>
            <input
              id="cuisine"
              value={values.cuisine}
              onChange={(event) => updateValue('cuisine', event.target.value)}
              className="field-input"
              placeholder="Mediterranean"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="prep_time">
              Prep time (minutes)
            </label>
            <input
              id="prep_time"
              type="number"
              min="0"
              value={values.prep_time ?? ''}
              onChange={(event) => updateNumberValue('prep_time', event.target.value)}
              className="field-input"
            />
            {errors.prep_time ? <p className="field-error">{errors.prep_time}</p> : null}
          </div>

          <div>
            <label className="field-label" htmlFor="cook_time">
              Cook time (minutes)
            </label>
            <input
              id="cook_time"
              type="number"
              min="0"
              value={values.cook_time ?? ''}
              onChange={(event) => updateNumberValue('cook_time', event.target.value)}
              className="field-input"
            />
            {errors.cook_time ? <p className="field-error">{errors.cook_time}</p> : null}
          </div>

          <div>
            <label className="field-label" htmlFor="servings">
              Servings
            </label>
            <input
              id="servings"
              type="number"
              min="1"
              value={values.servings ?? ''}
              onChange={(event) => updateNumberValue('servings', event.target.value)}
              className="field-input"
            />
            {errors.servings ? <p className="field-error">{errors.servings}</p> : null}
          </div>

          <label className="flex items-center gap-3 rounded-3xl border border-recipe-creamDeep bg-recipe-cream/70 px-4 py-4 text-sm text-recipe-ink/80 dark:border-recipe-clay/60 dark:bg-[#2a1b15] dark:text-recipe-sand/78">
            <input
              type="checkbox"
              checked={values.is_favorite}
              onChange={(event) => updateValue('is_favorite', event.target.checked)}
              className="h-4 w-4 rounded border-recipe-creamDeep text-recipe-orange focus:ring-recipe-orange"
            />
            Mark as a favorite
          </label>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-recipe-ink dark:text-recipe-sand">Ingredients</h2>
              <p className="text-sm text-recipe-ink/65 dark:text-recipe-sand/62">
                Keep each line easy to scan at a glance.
              </p>
            </div>
            <button type="button" onClick={() => addListItem('ingredients')} className="btn-ghost">
              <PlusIcon className="h-4 w-4" />
              <span>Add row</span>
            </button>
          </div>

          <div className="space-y-3">
            {values.ingredients.map((ingredient, index) => (
              <div key={`ingredient-${index}`} className="flex gap-3">
                <input
                  value={ingredient}
                  onChange={(event) => updateListValue('ingredients', index, event.target.value)}
                  className="field-input"
                  placeholder="2 tbsp olive oil"
                />
                <button
                  type="button"
                  onClick={() => removeListItem('ingredients', index)}
                  className="icon-button"
                  aria-label={`Remove ingredient ${index + 1}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {errors.ingredients ? <p className="field-error">{errors.ingredients}</p> : null}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-recipe-ink dark:text-recipe-sand">Instructions</h2>
              <p className="text-sm text-recipe-ink/65 dark:text-recipe-sand/62">
                Break the method into calm, readable steps.
              </p>
            </div>
            <button type="button" onClick={() => addListItem('instructions')} className="btn-ghost">
              <PlusIcon className="h-4 w-4" />
              <span>Add step</span>
            </button>
          </div>

          <div className="space-y-3">
            {values.instructions.map((instruction, index) => (
              <div key={`instruction-${index}`} className="flex gap-3">
                <textarea
                  value={instruction}
                  onChange={(event) => updateListValue('instructions', index, event.target.value)}
                  className="textarea-field min-h-[88px]"
                  rows={3}
                  placeholder={`Step ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeListItem('instructions', index)}
                  className="icon-button h-12 self-start"
                  aria-label={`Remove instruction ${index + 1}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {errors.instructions ? <p className="field-error">{errors.instructions}</p> : null}
        </section>

        <section>
          <label className="field-label" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            value={values.notes}
            onChange={(event) => updateValue('notes', event.target.value)}
            className="textarea-field"
            rows={4}
            placeholder="Serving notes, substitutions, or a trick you want to remember later."
          />
        </section>
      </div>

      <aside className="space-y-6">
        <div className="surface-panel space-y-5 px-5 py-6 sm:px-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
              Image
            </p>
            <h2 className="font-display text-2xl text-recipe-ink dark:text-recipe-sand">Recipe cover</h2>
          </div>

          <div className="flex rounded-full bg-recipe-cream p-1 dark:bg-[#2a1b15]">
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                imageMode === 'url'
                  ? 'bg-white text-recipe-ink shadow-sm dark:bg-[#1b120e] dark:text-recipe-sand dark:shadow-none'
                  : 'text-recipe-ink/60 hover:text-recipe-ink dark:text-recipe-sand/55 dark:hover:text-recipe-sand'
              }`}
            >
              Image URL
            </button>
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                imageMode === 'upload'
                  ? 'bg-white text-recipe-ink shadow-sm dark:bg-[#1b120e] dark:text-recipe-sand dark:shadow-none'
                  : 'text-recipe-ink/60 hover:text-recipe-ink dark:text-recipe-sand/55 dark:hover:text-recipe-sand'
              }`}
            >
              Upload file
            </button>
          </div>

          {imageMode === 'url' ? (
            <div>
              <label className="field-label" htmlFor="image_url">
                Public image URL
              </label>
              <input
                id="image_url"
                value={values.image_url}
                onChange={(event) => updateValue('image_url', event.target.value)}
                className="field-input"
                placeholder="https://images.example.com/your-dish.jpg"
              />
              <p className="mt-2 text-xs leading-6 text-recipe-ink/55 dark:text-recipe-sand/55">
                Use this if you want the simplest setup without Storage.
              </p>
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-recipe-creamDeep bg-recipe-cream/60 p-5 dark:border-recipe-clay/60 dark:bg-[#2a1b15]">
              <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
                <span className="rounded-full bg-white p-3 text-recipe-ember shadow-sm dark:bg-[#1b120e] dark:text-recipe-copper dark:shadow-none">
                  <UploadIcon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-recipe-ink dark:text-recipe-sand">
                  {imageFile ? imageFile.name : 'Choose an image to upload'}
                </span>
                <span className="text-xs leading-6 text-recipe-ink/55 dark:text-recipe-sand/55">
                  Upload uses the optional Supabase Storage bucket from the SQL docs.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          )}

          <div className="overflow-hidden rounded-[28px] bg-recipe-cream/80 dark:bg-[#2a1b15]">
            <RecipeImage
              src={imagePreview}
              alt="Recipe preview"
              className="aspect-[4/3] w-full object-cover"
              loading="eager"
            />
          </div>
        </div>

        <div className="surface-panel space-y-4 px-5 py-6 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-orange">
              Finish
            </p>
            <h2 className="mt-1 font-display text-2xl text-recipe-ink dark:text-recipe-sand">
              {mode === 'create' ? 'Save a new recipe' : 'Update this recipe'}
            </h2>
          </div>
          <p className="text-sm leading-7 text-recipe-ink/68 dark:text-recipe-sand/66">
            The form keeps structure lightweight, but the end result is still ready for a
            polished personal cookbook.
          </p>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting
              ? mode === 'create'
                ? 'Saving recipe…'
                : 'Updating recipe…'
              : mode === 'create'
                ? 'Create recipe'
                : 'Save changes'}
          </button>
        </div>
      </aside>
    </form>
  );
}
