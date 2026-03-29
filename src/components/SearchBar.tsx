import { useEffect, useState } from 'react';

import { SearchIcon } from './ui/Icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isPending?: boolean;
  size?: 'default' | 'hero';
}

const HERO_PROMPTS = ['citrus', 'breakfast', 'mediterranean', 'dinner'];
const DEFAULT_PROMPTS = ['citrus', 'breakfast', 'dinner'];

export function SearchBar({
  value,
  onChange,
  isPending = false,
  size = 'default',
}: SearchBarProps) {
  const isHero = size === 'hero';
  const [isFocused, setIsFocused] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const prompts = isHero ? HERO_PROMPTS : DEFAULT_PROMPTS;
  const activePrompt = prompts[promptIndex];

  useEffect(() => {
    if (value || isFocused || isPending) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setPromptIndex((currentIndex) => (currentIndex + 1) % prompts.length);
    }, 2400);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isFocused, isPending, prompts.length, value]);

  return (
    <div className={`relative ${isHero ? 'space-y-3' : ''}`}>
      <label
        className={`search-shell group relative isolate flex items-center gap-3 overflow-hidden rounded-full border border-white/16 bg-white/10 shadow-[0_18px_36px_rgba(168,98,35,0.12)] backdrop-blur-xl transition duration-500 dark:border-white/10 dark:bg-[#1b120e]/72 dark:shadow-none ${
          isFocused
            ? 'border-recipe-orange/55 shadow-[0_24px_56px_rgba(196,98,28,0.2)]'
            : 'hover:border-white/24 hover:bg-white/[0.13]'
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
          placeholder="Search by title, category, or cuisine"
          className={`relative z-10 w-full min-w-0 bg-transparent text-recipe-ink placeholder:text-recipe-ink/42 focus:outline-none dark:text-recipe-sand dark:placeholder:text-recipe-sand/42 ${
            isHero ? 'text-base sm:text-lg' : 'text-sm'
          }`}
          aria-label="Search recipes"
        />

        <div className="relative z-10 flex shrink-0 items-center gap-2">
          {!value && !isPending ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onChange(activePrompt)}
              className={`hidden items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-recipe-burnt/85 transition duration-300 hover:border-recipe-orange/40 hover:bg-recipe-orange/14 hover:text-recipe-ember dark:text-recipe-peel/85 dark:hover:text-recipe-copper ${
                isHero ? 'sm:inline-flex' : 'md:inline-flex'
              }`}
              aria-label={`Search for ${activePrompt}`}
            >
              <span className="text-recipe-ink/45 dark:text-recipe-sand/45">Try</span>
              <span className="animate-search-bob text-recipe-burnt dark:text-recipe-peel">
                {activePrompt}
              </span>
            </button>
          ) : null}

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

      {isHero ? (
        <div className="flex flex-wrap gap-2 px-2">
          {['Citrus', 'Breakfast', 'Dinner'].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onChange(prompt.toLowerCase())}
              className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-recipe-burnt/75 transition duration-300 hover:-translate-y-0.5 hover:border-recipe-orange/40 hover:bg-recipe-orange/12 hover:text-recipe-ember dark:text-recipe-peel/75 dark:hover:text-recipe-copper"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
