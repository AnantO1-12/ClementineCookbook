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
                    burnt: '#8d3c18',
                    rust: '#b5521d',
                    peel: '#ffd38c',
                    marmalade: '#ff9d33',
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
                grain: "radial-gradient(circle at top left, rgba(242, 143, 52, 0.2), transparent 38%), radial-gradient(circle at bottom right, rgba(111, 123, 91, 0.18), transparent 32%)",
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
                drift: {
                    '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
                    '50%': { transform: 'translate3d(18px, -16px, 0) rotate(3deg)' },
                },
                'drift-reverse': {
                    '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
                    '50%': { transform: 'translate3d(-16px, 14px, 0) rotate(-4deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
                    '50%': { opacity: '0.95', transform: 'scale(1.06)' },
                },
            },
            animation: {
                float: 'float 8s ease-in-out infinite',
                rise: 'rise 600ms ease-out both',
                drift: 'drift 18s ease-in-out infinite',
                'drift-reverse': 'drift-reverse 20s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 7s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
