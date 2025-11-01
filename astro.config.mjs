import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import solid from '@astrojs/solid-js'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  integrations: [
    react(),
    solid({ include: ['**/*.solid.tsx', '**/*.solid.jsx'] }),
    mdx(),
  ],
  vite: { plugins: [tailwindcss()] },
})
