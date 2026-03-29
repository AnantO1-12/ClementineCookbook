import { useState } from 'react';
import { Link } from 'react-router-dom';

import { SearchIcon } from './ui/Icons';

interface SearchSuggestion {
  id: string;
  title: string;
  slug: string;
  detail?: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isPending?: boolean;
  size?: 'default' | 'hero';
  suggestions?: SearchSuggestion[];
}

export function SearchBar({
  value,
  onChange,
  isPending = false,
  size = 'default',
  suggestions = [],
}: SearchBarProps) {
  const isHero = size === 'hero';
  const [isFocused, setIsFocused] = useState(false);
  const shouldShowSuggestions = value.trim().length > 0 && suggestions.length > 0;

  return (
    <div className="relative">
      <label
        className={`search-shell group relative isolate flex items-center gap-3 overflow-hidden rounded-full border border-white/16 bg-white/10 shadow-[0_18px_36px_rgba(168,98,35,0.12)] backdrop-blur-xl transition duration-500 dark:border-white/10 dark:bg-[#1b120e]/72 dark:shadow-none ${
          isFocused
            ? 'border-recipe-orange/55 shadow-[0_24px_56px_rgba(196,98,28,0.2)]'
            : 'hover:border-recipe-orange/70 hover:bg-white/[0.13] hover:shadow-[0_0_0_1px_rgba(242,143,52,0.3),0_22px_48px_rgba(242,143,52,0.22)]'
        } ${isHero ? 'px-4 py-3.5 sm:px-5 sm:py-4' : 'px-4 py-3'}`}
      >
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,186,120,0.02),rgba(255,255,255,0.04))]" />
        <div
          className={`pointer-events-none absolute -left-16 top-1/2 h-24 w-40 -translate-y-1/2 rounded-full bg-recipe-orange/12 blur-3xl transition duration-500 ${
            isFocused || isPending ? 'opacity-100 translate-x-8' : 'opacity-45'
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-y-1 left-[-20%] w-32 rounded-full bg-gradient-to-r from-transparent via-white/18 to-transparent blur-xl ${
            isFocused || isPending ? 'animate-search-sheen opacity-100' : 'opacity-0'
          }`}
        />

        <span
          className={`relative z-10 flex shrink-0 items-center justify-center rounded-full border transition duration-300 ${
            isFocused || value
              ? 'border-recipe-orange/45 bg-recipe-orange/14 text-recipe-peel shadow-[0_0_0_8px_rgba(242,143,52,0.08)]'
              : 'border-white/12 bg-white/8 text-recipe-burnt/70 dark:text-recipe-peel/75'
          } ${isHero ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-10 w-10'}`}
        >
          <SearchIcon
            className={`${isHero ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-5 w-5'} ${
              isPending ? 'animate-search-bob' : ''
            }`}
          />
        </span>

        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search by title or ingredient"
          className={`relative z-10 w-full min-w-0 bg-transparent text-recipe-ink placeholder:text-recipe-ink/42 focus:outline-none dark:text-recipe-sand dark:placeholder:text-recipe-sand/42 ${
            isHero ? 'text-base sm:text-lg' : 'text-sm'
          }`}
          aria-label="Search recipes"
        />

        <div className="relative z-10 flex shrink-0 items-center gap-2">
          {value ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onChange('')}
              className={`rounded-full border border-white/14 bg-white/10 px-3 py-2 font-semibold uppercase tracking-[0.22em] text-recipe-burnt/85 transition duration-300 hover:border-recipe-orange/40 hover:bg-recipe-orange/14 hover:text-recipe-ember dark:text-recipe-peel/85 dark:hover:text-recipe-copper ${
                isHero ? 'text-[11px]' : 'text-[10px]'
              }`}
              aria-label="Clear search"
            >
              Clear
            </button>
          ) : null}

          {isPending ? (
            <span
              className={`inline-flex items-center gap-2 rounded-full border border-recipe-orange/25 bg-recipe-orange/12 px-3 py-2 font-semibold uppercase tracking-[0.22em] text-recipe-burnt dark:text-recipe-peel ${
                isHero ? 'text-[11px] sm:text-xs' : 'text-[10px]'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current animate-search-pulse" />
              Refining
            </span>
          ) : null}
        </div>
      </label>

      {shouldShowSuggestions ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.75rem)] z-30 overflow-hidden rounded-[26px] border border-recipe-orange/35 bg-[linear-gradient(180deg,rgba(59,33,22,0.96)_0%,rgba(51,28,18,0.94)_100%)] shadow-[0_26px_54px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-recipe-peel/72">
            Recipe suggestions
          </div>
          <div className="p-2">
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion.id}
                to={`/recipes/${suggestion.slug}`}
                className="flex items-center justify-between gap-4 rounded-[20px] px-4 py-3 transition duration-300 hover:bg-white/8"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#fff2e4]">{suggestion.title}</p>
                  {suggestion.detail ? (
                    <p className="mt-1 truncate text-xs text-[#ffdcbc]/72">{suggestion.detail}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-recipe-peel/72">
                  Open
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
