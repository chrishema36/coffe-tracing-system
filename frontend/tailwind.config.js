/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0907',      // Deep Obsidian Espresso
        surface: '#15120E',         // Rich Warm Dark Surface
        surfaceHover: '#201B15',    // Surface Hover
        surfaceCard: '#1A1612',     // Glass Card Surface
        borderToken: '#2D251E',     // Border Warm Sepia
        borderHighlight: '#42362C',
        amberAccent: '#F59E0B',     // Luminous Gold Accent
        amberGlow: '#D97706',
        emeraldAccent: '#10B981',   // Vibrant High-Contrast Emerald Green
        emeraldBright: '#34D399',
      },
    },
  },
  plugins: [],
};
