/**
 * PostCSS Configuration
 *
 * Tailwind CSS v4 uses @tailwindcss/postcss for PostCSS integration.
 * This config is used by the build pipeline to process CSS.
 */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
};
