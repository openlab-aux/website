// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [svelte(), icon()],

  env: {
    schema: {
      DIRECTUS_URL: envField.string({context: "server", access: "public"}),
      DIRECTUS_TOKEN: envField.string({context: "server", access: "secret"})
    }
  }
});