import type { APIRoute } from "astro";
import { createEvents, type EventAttributes } from "ics";
import {
  getCalendarEvents,
  getRawCalendarEvents,
  type CalendarEvent,
} from "../../util/directus";
import { DateTime } from "luxon";

function mapDirectus(directusEvent: CalendarEvent): EventAttributes {
  const baseValue = {
    title: directusEvent.title,
    description: directusEvent.description,
    location: directusEvent.location,
    start: DateTime.fromISO(directusEvent.starts_at).toMillis(),
    url: directusEvent.url ?? undefined,
    recurrenceRule:
      directusEvent.recurring?.replace(/^RRULE:/, "") ?? undefined,
    classification: directusEvent.public ? "PUBLIC" : "PRIVATE",
  };

  if (directusEvent.ends_at) {
    return {
      end: DateTime.fromISO(directusEvent.ends_at).toMillis(),
      ...baseValue,
    };
  } else {
    return { duration: { days: 1 }, ...baseValue };
  }
}

export const GET: APIRoute = async () => {
  const directusEvents = await getRawCalendarEvents();
  const ics = createEvents(directusEvents.map(mapDirectus));

  console.log(directusEvents);

  if (ics.error) {
    console.error(ics.error);
    return new Response(ics.error.message);
  }

  return new Response(ics.value, {
    headers: {
      "Content-Type": "text/calendar",
    },
  });
};
