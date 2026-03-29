import { SearchIcon } from './ui/Icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isPending?: boolean;
}

export function SearchBar({ value, onChange, isPending = false }: SearchBarProps) {
  return (
    <label className="surface-panel flex items-center gap-3 px-4 py-3">
      <SearchIcon className="h-5 w-5 text-recipe-ink/45" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title, category, or cuisine"
        className="w-full bg-transparent text-sm text-recipe-ink placeholder:text-recipe-ink/45 focus:outline-none"
        aria-label="Search recipes"
      />
      {isPending ? (
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-recipe-orange">
          Refining
        </span>
      ) : null}
    </label>
  );
}
