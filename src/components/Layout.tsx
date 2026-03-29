import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Navbar } from './Navbar';

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[26rem] bg-[radial-gradient(circle_at_12%_8%,rgba(255,196,136,0.4),transparent_0_24%),radial-gradient(circle_at_86%_14%,rgba(255,140,49,0.18),transparent_0_20%)] dark:bg-[radial-gradient(circle_at_12%_8%,rgba(255,180,98,0.22),transparent_0_24%),radial-gradient(circle_at_86%_14%,rgba(255,140,49,0.16),transparent_0_20%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grain" />
      <div className="pointer-events-none absolute left-[-10rem] top-20 -z-10 h-[28rem] w-[28rem] rounded-full bg-recipe-apricot/45 blur-3xl animate-drift dark:bg-recipe-orange/18" />
      <div className="pointer-events-none absolute right-[-10rem] top-[16rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-recipe-orange/12 blur-3xl animate-drift-reverse dark:bg-recipe-ember/22" />
      <div className="pointer-events-none absolute bottom-[-10rem] left-1/3 -z-10 h-96 w-96 rounded-full bg-white/25 blur-3xl animate-pulse-glow dark:bg-recipe-copper/10" />
      <div className="pointer-events-none absolute inset-x-0 top-[7rem] -z-10 h-40 bg-gradient-to-b from-white/26 to-transparent blur-3xl dark:from-recipe-orange/8" />

      <Navbar />

      <main className="app-shell py-8 sm:py-10 xl:py-12">
        <Outlet />
      </main>

      <footer className="app-shell pb-10 pt-6 text-sm text-recipe-burnt/70 dark:text-recipe-sand/50">
        Built for a personal kitchen library with React, Vite, Supabase, and a little citrus.
      </footer>
    </div>
  );
}
