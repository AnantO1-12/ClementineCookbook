import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ArrowRightIcon, LoginIcon } from '../components/ui/Icons';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

interface RedirectState {
  from?: string;
}

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, signIn } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as RedirectState | null)?.from ?? '/';

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      showToast({
        title: 'Welcome back',
        description: 'Admin tools are unlocked for this session.',
        tone: 'success',
      });
      navigate(redirectTo, { replace: true });
    } catch (signInError) {
      showToast({
        title: 'Sign-in failed',
        description: signInError instanceof Error ? signInError.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
      <section className="surface-panel flex flex-col justify-between gap-8 overflow-hidden px-5 py-6 sm:px-7 sm:py-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-recipe-orange">
            Admin sign-in
          </p>
          <h1 className="font-display text-4xl leading-tight text-recipe-ink sm:text-5xl">
            Public browsing, private editing.
          </h1>
          <p className="max-w-lg text-base leading-8 text-recipe-ink/72">
            Recipes stay visible to everyone, but adding, updating, and deleting dishes is reserved for your admin account.
          </p>
        </div>

        <div className="rounded-[32px] bg-recipe-cream p-5">
          <p className="text-sm leading-7 text-recipe-ink/70">
            Create your admin user in Supabase Auth first, then sign in here with that email and password.
          </p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-recipe-ember">
            <span>Back to recipes</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="surface-panel px-5 py-6 sm:px-7 sm:py-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-recipe-orange text-white shadow-soft">
              <LoginIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-3xl text-recipe-ink">Sign in</p>
              <p className="text-sm text-recipe-ink/60">Use your Supabase email/password credentials.</p>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field-input"
              placeholder="chef@example.com"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </div>
  );
}
