/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        'scale-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.07)' },
        },
      },
      animation: {
        'scale-pulse': 'scale-pulse 1.6s ease-in-out infinite',
      },
      zIndex: {
        'bottom-nav': '40',
      },
      spacing: {
        'nav-offset': 'calc(5rem + max(0.75rem, env(safe-area-inset-bottom)))',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
        'glass-bubble': '0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
      },
      colors:{
        colors: {
          'nba-blue': '#1D428A', // Custom color example (NBA Blue)
          'nba-navy': '#0F2A5C',
          'nba-red': '#C8102E',  // Custom color example (NBA Red)
          'nba-yellow': '#FDB927', // Custom color example (NBA Yellow)
          'nba-green': '#10B981',
          'nba-sky': '#7EB6FF',
          'select-bet':'#ccffcc',
          'test': 'rgb(22,106,234,0.57)',
        },
      }
    },
  },
  plugins: [],
};
