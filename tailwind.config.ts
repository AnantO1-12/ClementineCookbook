import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        recipe: {
          cream: '#fff7ef',
          creamDeep: '#f4e1cc',
          ink: '#2e241e',
          sage: '#6f7b5b',
          orange: '#f28f34',
          ember: '#cb5d19',
          apricot: '#ffd3aa',
          copper: '#ffb462',
          sand: '#f8e7d5',
          clay: '#764221',
          dusk: '#221510',
          night: '#140c09',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 40px rgba(155, 96, 35, 0.14)',
        card: '0 14px 28px rgba(46, 36, 30, 0.08)',
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at top left, rgba(242, 143, 52, 0.2), transparent 38%), radial-gradient(circle at bottom right, rgba(111, 123, 91, 0.18), transparent 32%)",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -8px, 0)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        rise: 'rise 600ms ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
