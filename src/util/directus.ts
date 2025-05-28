import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { getSecret } from "astro:env/server";
import { DateTime, type DateObjectUnits } from "luxon";
import rrule from "rrule";
import { v4 as uuidv4 } from "uuid";

const DIRECTUS_URL = getSecret("DIRECTUS_URL")!;
const DIRECTUS_TOKEN = getSecret("DIRECTUS_TOKEN");

export let directusClient = createDirectus(DIRECTUS_URL).with(rest());
if (DIRECTUS_TOKEN) {
  directusClient = directusClient.with(staticToken(DIRECTUS_TOKEN));
}