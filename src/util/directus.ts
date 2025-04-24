import { createDirectus, rest, staticToken } from "@directus/sdk";
import { DIRECTUS_URL, DIRECTUS_TOKEN } from "astro:env/server";

export interface Calendar {
  id: string;
  status: "draft" | "published" | "archived";
  title: string;
  description: string;
  image: string;
  location: string;
  public: boolean;
  starts_at: string;
  ends_at: string;
  url?: string;
}

export interface Schema {
  Calendar: Calendar[];
}

let client = createDirectus<Schema>(DIRECTUS_URL).with(rest());

if (DIRECTUS_TOKEN) {
  client = client.with(staticToken(DIRECTUS_TOKEN));
}

export default client;
