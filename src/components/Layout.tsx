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
      <div className="pointer-events-none absolute left-[-6rem] top-32 -z-10 h-72 w-72 rounded-full bg-recipe-apricot/40 blur-3xl" />
      <div className="pointer-events-none absolute right-[-5rem] top-[24rem] -z-10 h-96 w-96 rounded-full bg-recipe-orange/10 blur-3xl" />

      <Navbar />

      <main className="app-shell py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="app-shell pb-10 pt-4 text-sm text-recipe-ink/55">
        Built for a personal kitchen library with React, Vite, Supabase, and a little citrus.
      </footer>
    </div>
  );
}
