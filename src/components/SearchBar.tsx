import { SearchIcon } from './ui/Icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isPending?: boolean;
  size?: 'default' | 'hero';
}

export function SearchBar({
  value,
  onChange,
  isPending = false,
  size = 'default',
}: SearchBarProps) {
  const isHero = size === 'hero';

  return (
    <label
      className={`flex items-center gap-3 rounded-full border border-white/70 bg-white/76 shadow-[0_18px_36px_rgba(168,98,35,0.12)] backdrop-blur-xl transition duration-300 dark:border-white/10 dark:bg-[#1b120e]/72 dark:shadow-none ${
        isHero ? 'px-6 py-5 sm:px-7' : 'px-5 py-4'
      }`}
    >
      <SearchIcon
        className={`${isHero ? 'h-6 w-6' : 'h-5 w-5'} text-recipe-burnt/60 dark:text-recipe-peel/75`}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title, category, or cuisine"
        className={`w-full bg-transparent text-recipe-ink placeholder:text-recipe-ink/45 focus:outline-none dark:text-recipe-sand dark:placeholder:text-recipe-sand/45 ${
          isHero ? 'text-base sm:text-lg' : 'text-sm'
        }`}
        aria-label="Search recipes"
      />
      {isPending ? (
        <span
          className={`font-semibold uppercase tracking-[0.24em] text-recipe-burnt dark:text-recipe-peel ${
            isHero ? 'text-[11px] sm:text-xs' : 'text-xs'
          }`}
        >
          Refining
        </span>
      ) : null}
    </label>
  );
}
