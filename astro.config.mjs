// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";
import markdownIntegration from "@astropub/md";

import icon from "astro-icon";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [svelte(), icon(), markdownIntegration()],

  env: {
    schema: {
      DIRECTUS_URL: envField.string({ context: "server", access: "public" }),
      DIRECTUS_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },

  adapter: node({
    mode: "standalone",
  }),
});