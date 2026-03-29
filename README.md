# Clementine Cookbook

Clementine is a polished personal recipe manager built with React, Vite, Tailwind CSS, and Supabase. It gives you a warm cookbook-style browsing experience, public recipe pages, and a lightweight admin flow for creating, editing, deleting, and optionally uploading recipe images.

## Features

- Mobile-first cookbook interface with editorial orange styling
- Search, category filters, and sort controls on the home page
- Recipe detail pages with ingredients, instructions, notes, and metadata
- Protected add and edit routes powered by Supabase Auth
- Optional delete and favorite toggles for the signed-in admin
- Optional Supabase Storage support for recipe cover uploads
- Vercel-ready SPA routing via `vercel.json`

## Tech Stack

- React 18 + Vite + TypeScript
- React Router
- Tailwind CSS
- Supabase JS client
- Supabase Postgres + Auth + optional Storage
- Vercel for deployment

## Project Structure

```text
.
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── package.json
├── postcss.config.js
├── public
│   ├── favicon.svg
│   └── recipe-placeholder.svg
├── src
│   ├── App.tsx
│   ├── components
│   │   ├── CategoryFilter.tsx
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeForm.tsx
│   │   ├── RecipeImage.tsx
│   │   ├── SearchBar.tsx
│   │   └── ui
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── Icons.tsx
│   │       └── LoadingSpinner.tsx
│   ├── context
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks
│   │   ├── useAuth.ts
│   │   ├── useRecipes.ts
│   │   └── useToast.ts
│   ├── index.css
│   ├── lib
│   │   ├── env.ts
│   │   └── supabase.ts
│   ├── main.tsx
│   ├── pages
│   │   ├── AddRecipePage.tsx
│   │   ├── EditRecipePage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── RecipeDetailPage.tsx
│   ├── services
│   │   └── recipeService.ts
│   ├── types
│   │   ├── recipe.ts
│   │   └── supabase.ts
│   ├── utils
│   │   ├── format.ts
│   │   └── slug.ts
│   └── vite-env.d.ts
├── supabase
│   ├── migrations
│   │   ├── 001_create_recipes.sql
│   │   └── 002_recipe_images_bucket.sql
│   └── seed.sql
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
└── mygoogle
```

`mygoogle/` was already present in the workspace and is unrelated to this app.

## Supabase Setup

### 1. Create a Supabase project

1. Create a new project at [supabase.com](https://supabase.com/).
2. Open `Project Settings > API` and copy:
   - `Project URL`
   - `anon public` key

### 2. Create your admin auth user

1. Open `Authentication > Users`.
2. Add a user with email/password.
3. This first auth user becomes the owner for the sample seed data.

### 3. Run the SQL in Supabase

Run these files in order from the SQL editor:

1. `supabase/migrations/001_create_recipes.sql`
2. Optional: `supabase/migrations/002_recipe_images_bucket.sql`
3. `supabase/seed.sql`

What each file does:

- `001_create_recipes.sql`
  - Creates the `public.recipes` table
  - Adds indexes and the `updated_at` trigger
  - Enables Row Level Security
  - Allows anyone to read recipes
  - Restricts create, update, and delete to the authenticated owner of each row
- `002_recipe_images_bucket.sql`
  - Creates a public `recipe-images` storage bucket
  - Allows signed-in users to upload only inside a folder named after their auth uid
- `seed.sql`
  - Inserts three sample recipes owned by your earliest auth user
  - Updates them if the slugs already exist

If you skip the storage SQL, the app still works. Use the image URL option in the form instead of file upload.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Copy `.env.example` to `.env` and fill in your Supabase values:

```bash
cp .env.example .env
```

Example:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### 3. Start the app

```bash
npm run dev
```

The default Vite URL is usually [http://localhost:5173](http://localhost:5173).

### 4. Build locally

```bash
npm run build
```

## Vercel Deployment

### 1. Import the repository into Vercel

Vercel should detect this as a Vite project automatically.

### 2. Add environment variables in Vercel

Set these exactly in `Project Settings > Environment Variables`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Confirm build settings

These usually auto-fill correctly, but the expected values are:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

### 4. Deploy

Click Deploy.

`vercel.json` is included so React Router routes continue to work on browser refresh and direct deep links like `/recipes/spiced-tomato-lentil-soup`.

## Admin Flow

- Anyone can browse recipes.
- Only the signed-in owner can create, update, delete, or toggle favorites.
- Login uses Supabase email/password auth.
- Protected routes:
  - `/recipes/new`
  - `/recipes/:slug/edit`

## Notes

- Slugs are generated in the app and de-duplicated before insert/update.
- Recipe ingredients and instructions are stored as JSON arrays of strings.
- If storage uploads fail, switch the form to image URL mode or run `002_recipe_images_bucket.sql`.
