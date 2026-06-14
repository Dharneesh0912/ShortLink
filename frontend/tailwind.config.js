/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bg: '#0B1120',
        surface: '#111827',
        card: '#1E293B',
        primary: {
          DEFAULT: '#6366F1',
          2: '#8B5CF6',
          light: '#a5b4fc',
        },
        accent: '#06B6D4',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        muted: '#94A3B8',
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 3.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}