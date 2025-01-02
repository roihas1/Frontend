/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        colors: {
          'nba-blue': '#1D428A', // Custom color example (NBA Blue)
          'nba-red': '#C8102E',  // Custom color example (NBA Red)
          'nba-yellow': '#FDB927', // Custom color example (NBA Yellow)
          'select-bet':'#ccffcc',
        },
      }
    },
  },
  plugins: [],
};
