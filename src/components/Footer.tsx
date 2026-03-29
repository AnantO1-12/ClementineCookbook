import { NavLink } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { LoginIcon } from './ui/Icons';

export function Footer() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <footer className="relative mt-10 border-t border-black/10 bg-gradient-to-r from-[#3a1c12] via-recipe-burnt to-[#7b3517] text-[#fff4ea] shadow-[0_-18px_42px_rgba(53,20,7,0.18)]">
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
      <div className="app-shell relative flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/14">
            <img
              src="/clementine-slice-logo.png"
              alt="Clementine orange slice logo"
              className="citrus-logo h-10 w-10 object-contain"
            />
          </span>
          <div className="space-y-1">
            <p className="font-display text-2xl leading-none text-[#fff5eb]">Clementine</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffe6cc]/68">
              Personal cookbook
            </p>
            <p className="text-sm text-[#ffe9d4]/78">
              Peeled, tested, and lovingly plated.
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          loading ? (
            <span className="inline-flex items-center rounded-full border border-white/12 bg-white/10 px-4 py-2.5 text-sm font-semibold text-[#ffe9d4]/78">
              Checking session…
            </span>
          ) : (
            <NavLink
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2.5 text-sm font-semibold text-[#ffe9d4] transition duration-300 hover:-translate-y-0.5 hover:bg-white/16 hover:text-white"
            >
              <LoginIcon className="h-4 w-4" />
              <span>Admin login</span>
            </NavLink>
          )
        ) : null}
      </div>
    </footer>
  );
}
