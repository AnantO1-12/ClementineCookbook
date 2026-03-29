import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="surface-panel flex min-h-[280px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div className="rounded-full bg-recipe-apricot/70 p-4 text-recipe-ember dark:bg-recipe-orange/15 dark:text-recipe-copper">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12h16" />
          <path d="M7 12a5 5 0 1 0 10 0" />
          <path d="M8.5 8.5h7" />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-recipe-ink dark:text-recipe-sand">{title}</h2>
        <p className="max-w-md text-sm leading-7 text-recipe-ink/70 dark:text-recipe-sand/68">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
