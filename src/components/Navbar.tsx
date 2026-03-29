import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { LogoutIcon, PlusIcon } from './ui/Icons';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'clementine-theme';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function Navbar() {
  const { isAuthenticated, loading, signOut } = useAuth();
  const { showToast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [theme] = useState<ThemeMode>(() => getInitialTheme());
  const navPillBase =
    'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-300';
  const navPillInactive = `${navPillBase} border-white/12 bg-white/10 text-[#ffe9d4] hover:-translate-y-0.5 hover:bg-white/16 hover:text-white`;
  const navPillActive = `${navPillBase} border-[#ffd5a8]/30 bg-[#ffc176] text-[#512109] shadow-[0_12px_28px_rgba(53,20,7,0.22)]`;
  const navGhost =
    'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#ffe9d4]/80 transition duration-300 hover:bg-white/10 hover:text-white';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      showToast({
        title: 'Signed out',
        description: 'The editing tools are now tucked away.',
        tone: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Could not sign out',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-gradient-to-r from-recipe-burnt via-recipe-rust to-[#7b3517] text-[#fff4ea] shadow-[0_18px_42px_rgba(83,32,10,0.28)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
      <div className="app-shell relative flex flex-col gap-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <NavLink to="/" className="inline-flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/14">
              <img
                src="/clementine-slice-logo.png"
                alt="Clementine orange slice logo"
                className="citrus-logo h-12 w-12 animate-logo-spin object-contain"
              />
            </span>
            <div>
              <p className="font-display text-3xl leading-none text-[#fff5eb]">
                Clementine
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#ffe6cc]/65">
                Personal cookbook
              </p>
            </div>
          </NavLink>
        </div>

        <nav className="flex flex-wrap items-center gap-2 sm:justify-end">
          {isAuthenticated ? (
            <NavLink
              to="/recipes/new"
              className={({ isActive }) => (isActive ? navPillActive : navPillInactive)}
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add recipe</span>
            </NavLink>
          ) : null}

          {loading ? (
            <span className={`${navPillInactive} opacity-75`}>Checking session…</span>
          ) : isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={navGhost}
            >
              <LogoutIcon className="h-4 w-4" />
              <span>{isSigningOut ? 'Signing out…' : 'Log out'}</span>
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
