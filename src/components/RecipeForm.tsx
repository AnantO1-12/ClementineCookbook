import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import type { FormErrors, RecipeFormValues, RecipeMutationInput } from '../types/recipe';
import { normalizeStringArray } from '../utils/format';
import { RecipeImage } from './RecipeImage';
import { PlusIcon, TrashIcon, UploadIcon } from './ui/Icons';

type ListField = 'ingredients' | 'instructions';
type ImageMode = 'url' | 'upload';

export interface RecipeImageUpload {
  id: string;
  file: File;
}

export type RecipeThumbnailSelection =
  | { type: 'existing'; value: string }
  | { type: 'upload'; value: string }
  | null;

interface PendingImageUpload extends RecipeImageUpload {
  previewUrl: string;
}

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
  image_urls: [],
  is_favorite: false,
};

function createUploadId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildInitialThumbnailSelection(values: RecipeFormValues): RecipeThumbnailSelection {
  if (values.image_url) {
    return { type: 'existing', value: values.image_url };
  }

  if (values.image_urls[0]) {
    return { type: 'existing', value: values.image_urls[0] };
  }

  return null;
}

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialValues?: RecipeFormValues;
  submitting?: boolean;
  onSubmit: (
    values: RecipeMutationInput,
    imageUploads: RecipeImageUpload[],
    thumbnailSelection: RecipeThumbnailSelection,
  ) => Promise<void>;
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
  const [pendingImageUrl, setPendingImageUrl] = useState('');
  const [imageUploads, setImageUploads] = useState<PendingImageUpload[]>([]);
  const [thumbnailSelection, setThumbnailSelection] = useState<RecipeThumbnailSelection>(null);
  const imageUploadsRef = useRef<PendingImageUpload[]>([]);

  useEffect(() => {
    imageUploadsRef.current = imageUploads;
  }, [imageUploads]);

  useEffect(() => {
    return () => {
      imageUploadsRef.current.forEach((upload) => {
        URL.revokeObjectURL(upload.previewUrl);
      });
    };
  }, []);

  const clearPendingUploads = () => {
    imageUploadsRef.current.forEach((upload) => {
      URL.revokeObjectURL(upload.previewUrl);
    });
    imageUploadsRef.current = [];
    setImageUploads([]);
  };

  useEffect(() => {
    const nextValues = initialValues ?? DEFAULT_VALUES;
    setValues(nextValues);
    setImageMode('url');
    setPendingImageUrl('');
    clearPendingUploads();
    setThumbnailSelection(buildInitialThumbnailSelection(nextValues));
    setErrors({});
  }, [initialValues]);

  useEffect(() => {
    setThumbnailSelection((currentSelection) => {
      if (
        currentSelection?.type === 'existing' &&
        values.image_urls.includes(currentSelection.value)
      ) {
        return currentSelection;
      }

      if (
        currentSelection?.type === 'upload' &&
        imageUploads.some((upload) => upload.id === currentSelection.value)
      ) {
        return currentSelection;
      }

      if (values.image_urls[0]) {
        return { type: 'existing', value: values.image_urls[0] };
      }

      if (imageUploads[0]) {
        return { type: 'upload', value: imageUploads[0].id };
      }

      return null;
    });
  }, [imageUploads, values.image_urls]);

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

  const addImageUrl = () => {
    const normalizedUrl = pendingImageUrl.trim();

    if (!normalizedUrl) {
      return;
    }

    if (values.image_urls.includes(normalizedUrl)) {
      setPendingImageUrl('');
      return;
    }

    updateValue('image_urls', [...values.image_urls, normalizedUrl]);
    setPendingImageUrl('');
    setThumbnailSelection((currentSelection) =>
      currentSelection ?? { type: 'existing', value: normalizedUrl },
    );
  };

  const removeExistingImage = (url: string) => {
    updateValue(
      'image_urls',
      values.image_urls.filter((currentUrl) => currentUrl !== url),
    );
  };

  const removePendingUpload = (uploadId: string) => {
    setImageUploads((currentUploads) => {
      const uploadToRemove = currentUploads.find((upload) => upload.id === uploadId);

      if (uploadToRemove) {
        URL.revokeObjectURL(uploadToRemove.previewUrl);
      }

      return currentUploads.filter((upload) => upload.id !== uploadId);
    });
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);

    if (!nextFiles.length) {
      return;
    }

    const nextUploads = nextFiles.map((file) => ({
      id: createUploadId(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImageUploads((currentUploads) => [...currentUploads, ...nextUploads]);
    setThumbnailSelection((currentSelection) =>
      currentSelection ?? { type: 'upload', value: nextUploads[0].id },
    );
    event.target.value = '';
  };

  const imageCards = [
    ...values.image_urls.map((url) => ({
      id: `existing:${url}`,
      kind: 'existing' as const,
      src: url,
      label: 'Saved image',
      rawValue: url,
    })),
    ...imageUploads.map((upload) => ({
      id: `upload:${upload.id}`,
      kind: 'upload' as const,
      src: upload.previewUrl,
      label: upload.file.name,
      rawValue: upload.id,
    })),
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const inlineImageUrl = pendingImageUrl.trim();
    const imageUrls =
      inlineImageUrl && !values.image_urls.includes(inlineImageUrl)
        ? [...values.image_urls, inlineImageUrl]
        : values.image_urls;
    const effectiveThumbnailSelection =
      thumbnailSelection ??
      (imageUrls[0]
        ? { type: 'existing' as const, value: imageUrls[0] }
        : imageUploads[0]
          ? { type: 'upload' as const, value: imageUploads[0].id }
          : null);

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
        image_url:
          effectiveThumbnailSelection?.type === 'existing'
            ? effectiveThumbnailSelection.value.trim()
            : null,
        image_urls: imageUrls,
        is_favorite: values.is_favorite,
      },
      imageUploads.map(({ id, file }) => ({ id, file })),
      effectiveThumbnailSelection,
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
              Images
            </p>
            <h2 className="font-display text-2xl text-recipe-ink dark:text-recipe-sand">Recipe gallery</h2>
            <p className="text-sm leading-6 text-recipe-ink/62 dark:text-recipe-sand/62">
              Add as many images as you like, then click one to use it as the thumbnail.
            </p>
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
              Upload files
            </button>
          </div>

          {imageMode === 'url' ? (
            <div className="space-y-3">
              <label className="field-label" htmlFor="image_url">
                Public image URL
              </label>
              <div className="flex gap-3">
                <input
                  id="image_url"
                  value={pendingImageUrl}
                  onChange={(event) => setPendingImageUrl(event.target.value)}
                  className="field-input"
                  placeholder="https://images.example.com/your-dish.jpg"
                />
                <button type="button" onClick={addImageUrl} className="btn-secondary shrink-0">
                  Add image
                </button>
              </div>
              <p className="text-xs leading-6 text-recipe-ink/55 dark:text-recipe-sand/55">
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
                  Choose one or many images to upload
                </span>
                <span className="text-xs leading-6 text-recipe-ink/55 dark:text-recipe-sand/55">
                  To enable uploads, run `supabase/migrations/002_recipe_images_bucket.sql` once in your Supabase SQL Editor.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleFileSelection}
                />
              </label>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-recipe-ink/52 dark:text-recipe-sand/52">
                Image set
              </p>
              <p className="text-xs text-recipe-ink/52 dark:text-recipe-sand/52">
                {imageCards.length} image{imageCards.length === 1 ? '' : 's'}
              </p>
            </div>

            {imageCards.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {imageCards.map((imageCard) => {
                  const isThumbnail =
                    thumbnailSelection?.type === imageCard.kind &&
                    thumbnailSelection.value === imageCard.rawValue;

                  return (
                    <div
                      key={imageCard.id}
                      className={`overflow-hidden rounded-[24px] border transition duration-300 ${
                        isThumbnail
                          ? 'border-recipe-orange/70 shadow-[0_0_0_1px_rgba(242,143,52,0.35),0_18px_36px_rgba(242,143,52,0.16)]'
                          : 'border-white/10'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setThumbnailSelection({
                            type: imageCard.kind,
                            value: imageCard.rawValue,
                          })
                        }
                        className="block w-full text-left"
                      >
                        <RecipeImage
                          src={imageCard.src}
                          alt={imageCard.label}
                          className="aspect-[4/3] w-full object-cover"
                          loading="eager"
                        />
                      </button>
                      <div className="flex items-center justify-between gap-3 bg-recipe-cream/80 px-3 py-3 dark:bg-[#2a1b15]">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-recipe-ink dark:text-recipe-sand">
                            {imageCard.label}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-recipe-ink/48 dark:text-recipe-sand/48">
                            {isThumbnail ? 'Thumbnail' : 'Click to set thumbnail'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            imageCard.kind === 'existing'
                              ? removeExistingImage(imageCard.rawValue)
                              : removePendingUpload(imageCard.rawValue)
                          }
                          className="icon-button h-10 w-10"
                          aria-label={`Remove ${imageCard.label}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-hidden rounded-[28px] bg-recipe-cream/80 dark:bg-[#2a1b15]">
                <RecipeImage
                  src={null}
                  alt="Recipe preview"
                  className="aspect-[4/3] w-full object-cover"
                  loading="eager"
                />
              </div>
            )}
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
