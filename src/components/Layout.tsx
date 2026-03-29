import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Navbar } from './Navbar';

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grain" />
      <div className="pointer-events-none absolute left-[-8rem] top-28 -z-10 h-96 w-96 rounded-full bg-recipe-apricot/40 blur-3xl dark:bg-recipe-orange/15" />
      <div className="pointer-events-none absolute right-[-8rem] top-[18rem] -z-10 h-[28rem] w-[28rem] rounded-full bg-recipe-orange/10 blur-3xl dark:bg-recipe-ember/20" />
      <div className="pointer-events-none absolute bottom-[-8rem] left-1/4 -z-10 h-80 w-80 rounded-full bg-white/20 blur-3xl dark:bg-recipe-copper/10" />

      <Navbar />

      <main className="app-shell py-8 sm:py-10 xl:py-12">
        <Outlet />
      </main>

      <footer className="app-shell pb-10 pt-4 text-sm text-recipe-ink/55 dark:text-recipe-sand/50">
        Built for a personal kitchen library with React, Vite, Supabase, and a little citrus.
      </footer>
    </div>
  );
}
