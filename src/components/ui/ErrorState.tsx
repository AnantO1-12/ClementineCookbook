interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something interrupted the recipe flow',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="surface-panel flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <div className="rounded-full bg-rose-100 p-4 text-rose-500 dark:bg-rose-500/12 dark:text-rose-300">
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
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-recipe-ink dark:text-recipe-sand">{title}</h2>
        <p className="max-w-xl text-sm leading-7 text-recipe-ink/70 dark:text-recipe-sand/68">
          {message}
        </p>
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-secondary">
          Try again
        </button>
      ) : null}
    </div>
  );
}
