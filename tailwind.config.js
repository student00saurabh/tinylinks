/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs", // scan all ejs files inside views folder
    "./public/**/*.js", // scan js files
    "./*.html", // scan html at root (if index.html exists)
    "./public/**/*.html", // scan html inside public (if any)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
