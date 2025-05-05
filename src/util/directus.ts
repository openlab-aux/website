import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { getSecret } from "astro:env/server";
import { DateTime, type DateObjectUnits } from "luxon";
import rrule from "rrule";
import { v4 as uuidv4 } from "uuid";

export interface CalendarEvent {
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
}

export interface Schema {
  Calendar: CalendarEvent[];
}

const DIRECTUS_URL = getSecret("DIRECTUS_URL")!;
const DIRECTUS_TOKEN = getSecret("DIRECTUS_TOKEN");

let client = createDirectus<Schema>(DIRECTUS_URL).with(rest());

if (DIRECTUS_TOKEN) {
  client = client.with(staticToken(DIRECTUS_TOKEN));
}

function unfoldRecurring(event: CalendarEvent): CalendarEvent[] {
  if (event.recurring == null) {
    return [event];
  }

  const rruleObj = rrule.rrulestr(event.recurring, { forceset: true });

  const rruleSet = rruleObj.between(
    DateTime.now().minus({ hours: 24 }).toJSDate(),
    DateTime.now().plus({ months: 12 }).toJSDate(),
  );

  return rruleSet.map((date: Date) => {
    const newDate = {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    };

    return {
      ...event,
      id: `${event.id}_${newDate.year}${newDate.month}${newDate.day}`,
      starts_at:
        DateTime.fromISO(event.starts_at).set(newDate).toISO() || "what",
      ends_at: event.ends_at
        ? DateTime.fromISO(event.ends_at).set(newDate).toISO()
        : null,
    };
  });
}

export async function getRawCalendarEvents(): Promise<CalendarEvent[]> {
  const events = await client.request(
    readItems("Calendar", {
      filter: { status: { _eq: "published" } },
    }),
  );
  return events;
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const events = await getRawCalendarEvents();
  return events
    .map((ev) => unfoldRecurring(ev))
    .flat()
    .filter(
      (event) =>
        DateTime.fromISO(event.starts_at) > DateTime.now().minus({ hours: 12 }),
    )
    .toSorted((a, b) =>
      DateTime.fromISO(a.starts_at) < DateTime.fromISO(b.starts_at) ? -1 : 1,
    );
}
