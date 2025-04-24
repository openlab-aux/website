interface ImportMetaEnv {
  readonly DIRECTUS_URL: string;
  readonly DIRECTUS_TOKEN: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
