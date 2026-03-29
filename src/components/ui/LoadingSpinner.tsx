interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({
  label = 'Loading...',
  fullPage = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullPage ? 'min-h-[40vh]' : 'py-12'
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-recipe-orange/20 border-t-recipe-orange" />
        <p className="text-sm font-medium text-recipe-ink/70">{label}</p>
      </div>
    </div>
  );
}
