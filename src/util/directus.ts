import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { getSecret } from "astro:env/server";
import { DateTime, type DateObjectUnits } from "luxon";
import rrule from "rrule";
import { v4 as uuidv4 } from "uuid";

export interface CalendarEventDTO {
  id: string;
  status: "draft" | "published" | "archived";
  title: string;
  description: string;
  image: string | null;
  location: string;
  public: boolean;
  starts_at: string;
  ends_at: string | null;
  url: string | null;
  recurring: string | null;
  cancellations:
    | {
        cancelled_on: string;
        moved_to: string | null;
      }[]
    | null;
}

const DIRECTUS_URL = getSecret("DIRECTUS_URL")!;
const DIRECTUS_TOKEN = getSecret("DIRECTUS_TOKEN");

let calendarClient = createDirectus(DIRECTUS_URL).with(rest());

if (DIRECTUS_TOKEN) {
  calendarClient = calendarClient.with(staticToken(DIRECTUS_TOKEN));
}

export async function getRawEvents(): Promise<CalendarEventDTO[]> {
  const res = (await calendarClient.request(
    readItems("Calendar", {
      filter: {
        status: { _eq: "published" },
      },
    }),
  )) as CalendarEventDTO[];

  return res;
}
