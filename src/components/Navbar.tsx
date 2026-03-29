import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { LoginIcon, LogoutIcon, PlusIcon } from './ui/Icons';

export function Navbar() {
  const { isAuthenticated, loading, signOut } = useAuth();
  const { showToast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <header className="sticky top-0 z-40 border-b border-white/50 bg-recipe-cream/80 backdrop-blur-xl">
      <div className="app-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <NavLink to="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-recipe-orange text-white shadow-soft">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
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
            </span>
            <div>
              <p className="font-display text-2xl leading-none text-recipe-ink">Clementine</p>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-recipe-ink/55">
                Personal cookbook
              </p>
            </div>
          </NavLink>
        </div>

        <nav className="flex flex-wrap items-center gap-2 sm:justify-end">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'pill-active' : 'pill-button')}
          >
            Recipes
          </NavLink>

          {isAuthenticated ? (
            <NavLink
              to="/recipes/new"
              className={({ isActive }) => (isActive ? 'btn-primary' : 'btn-secondary')}
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add recipe</span>
            </NavLink>
          ) : null}

          {loading ? (
            <span className="pill-button opacity-75">Checking session…</span>
          ) : isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="btn-ghost"
            >
              <LogoutIcon className="h-4 w-4" />
              <span>{isSigningOut ? 'Signing out…' : 'Log out'}</span>
            </button>
          ) : (
            <NavLink to="/login" className="btn-ghost">
              <LoginIcon className="h-4 w-4" />
              <span>Admin login</span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
