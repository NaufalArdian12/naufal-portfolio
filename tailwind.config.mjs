import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,md,mdx,tsx,ts}'],
  darkMode: 'false',
  theme: {
    extend: {
      colors: {
        primary: '#0048BF',
        surface: {
          light: '#F2F4F7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      
    },
  },
  plugins: [typography()],
}
