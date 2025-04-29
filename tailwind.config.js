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
      colors:{
        colors: {
          'nba-blue': '#1D428A', // Custom color example (NBA Blue)
          'nba-red': '#C8102E',  // Custom color example (NBA Red)
          'nba-yellow': '#FDB927', // Custom color example (NBA Yellow)
          'select-bet':'#ccffcc',
          'test': 'rgb(22,106,234,0.57)',
        },
      }
    },
  },
  plugins: [],
};
