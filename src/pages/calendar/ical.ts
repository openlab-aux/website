import type { APIRoute } from "astro";
import { createEvents, type EventAttributes } from "ics";
import { getEvents, type CalendarEvent } from "../../util/event";

function mapDirectus(
  serverUrl: string,
  directusEvent: CalendarEvent,
): EventAttributes {
  const baseValue = {
    title: directusEvent.title,
    description: directusEvent.description,
    location: directusEvent.location,
    start: directusEvent.starts_at.toMillis(),
    url: `http://${serverUrl}/events/${directusEvent.id}`,
    recurrenceRule:
      directusEvent.recurring?.replace(/^RRULE:/, "") ?? undefined,
    classification: directusEvent.public ? "PUBLIC" : "PRIVATE",
  };

  if (directusEvent.ends_at) {
    return {
      end: directusEvent.ends_at.toMillis(),
      ...baseValue,
    };
  } else {
    return { duration: { days: 1 }, ...baseValue };
  }
}

export const GET: APIRoute = async ({ request }) => {
  const directusEvents = await getEvents();
  const ics = createEvents(
    directusEvents.map((event) =>
      mapDirectus(request.headers.get("host")!, event),
    ),
  );

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
