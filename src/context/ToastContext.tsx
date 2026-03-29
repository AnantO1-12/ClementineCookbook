import { createContext, useContext, useState, type PropsWithChildren } from 'react';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = (id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  const showToast = ({ title, description, tone = 'info' }: ToastInput) => {
    const id = crypto.randomUUID();
    const nextToast = { id, title, description, tone };

    setToasts((currentToasts) => [...currentToasts, nextToast]);

    window.setTimeout(() => {
      dismissToast(id);
    }, 3600);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-md flex-col gap-3 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-3xl border px-4 py-3 shadow-soft backdrop-blur-sm transition ${
              toast.tone === 'success'
                ? 'border-orange-200 bg-white/95 dark:border-recipe-orange/30 dark:bg-[#1b120e]/95'
                : toast.tone === 'error'
                  ? 'border-rose-200 bg-rose-50/95 dark:border-rose-400/25 dark:bg-[#2b1516]/95'
                  : 'border-slate-200 bg-white/95 dark:border-recipe-clay/40 dark:bg-[#1b120e]/95'
            }`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-recipe-ink dark:text-recipe-sand">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-1 text-sm text-recipe-ink/70 dark:text-recipe-sand/70">
                    {toast.description}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full p-1 text-recipe-ink/45 transition hover:bg-black/5 hover:text-recipe-ink dark:text-recipe-sand/45 dark:hover:bg-white/5 dark:hover:text-recipe-sand"
                aria-label="Dismiss notification"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 6-12 12" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToastContext must be used inside ToastProvider.');
  }

  return context;
}
