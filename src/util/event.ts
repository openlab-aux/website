import { DateTime, type DateObjectUnits } from "luxon";
import { getRawEvents, type CalendarEventDTO } from "./directus";
import rrule from "rrule";
import { getSecret } from "astro:env/server";

export interface CalendarEvent {
  id: string;

  title: string;
  description: string;
  public: boolean;
  location: string;

  starts_at: DateTime;

  ends_at?: DateTime;
  imageUrl?: string;
  externalUrl?: string;

  parent?: CalendarEvent;
  recurring?: string;
}

function eventFromDTO(event: CalendarEventDTO): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    public: event.public,
    location: event.location,
    starts_at: DateTime.fromISO(event.starts_at),

    ends_at: event.ends_at ? DateTime.fromISO(event.ends_at) : undefined,
    imageUrl: event.image
      ? `${getSecret("DIRECTUS_URL")}/assets/${event.image}`
      : undefined,
    externalUrl: event.url ? event.url : undefined,
    recurring: event.recurring ?? undefined,
  };
}

function moveEvent(event: CalendarEvent, newDate: DateTime): CalendarEvent {
  const newDateObj: DateObjectUnits = {
    year: newDate.year,
    month: newDate.month,
    day: newDate.day,
  };

  const res = {
    ...event,
    starts_at: event.starts_at.set(newDateObj),
    id: event.id + event.starts_at.toISODate(),
  };

  if (event.ends_at) {
    const duration = event.ends_at
      .diff(event.starts_at, ["days", "hours", "minutes", "seconds"])
      .toObject();
    res.ends_at = res.starts_at.plus(duration);
  }

  return res;
}

function eventIsCancelled(
  event: CalendarEvent,
  cancellations: { cancelled_on: DateTime; moved_to?: DateTime }[],
): boolean | DateTime {
  const matchingCancellation = cancellations.findLast((cancel) => {
    return (
      event.starts_at.hasSame(cancel.cancelled_on, "day") &&
      event.starts_at.hasSame(cancel.cancelled_on, "month") &&
      event.starts_at.hasSame(cancel.cancelled_on, "year")
    );
  });

  if (!matchingCancellation) {
    return false;
  }

  if (matchingCancellation.moved_to) {
    return matchingCancellation.moved_to;
  }

  return true;
}

function getRecurrences(event: CalendarEventDTO): CalendarEvent[] {
  if (!event.recurring) {
    return [];
  }

  const rruleObj = rrule.RRule.fromString(event.recurring);
  rruleObj.options.dtstart = DateTime.now().minus({ month: 3 }).toJSDate();

  const dates = rruleObj.between(
    DateTime.now().minus({ months: 3 }).toJSDate(),
    DateTime.now().plus({ months: 6 }).toJSDate(),
    true,
  );

  const cancellations = (event.cancellations || []).map((cancel) => {
    return {
      cancelled_on: DateTime.fromISO(cancel.cancelled_on),
      moved_to: cancel.moved_to ? DateTime.fromISO(cancel.moved_to) : undefined,
    };
  });

  const parentEvent = eventFromDTO(event);

  return dates
    .map((date) => DateTime.fromJSDate(date))
    .map((date) => moveEvent(parentEvent, date))
    .filter((event) => {
      const applyingCancellation = cancellations.findLast((cancellation) => {
        return (
          event.starts_at.hasSame(cancellation.cancelled_on, "day") &&
          event.starts_at.hasSame(cancellation.cancelled_on, "month") &&
          event.starts_at.hasSame(cancellation.cancelled_on, "year")
        );
      });

      return !applyingCancellation;
    })
    .concat(
      cancellations
        .filter((cancellation) => cancellation.moved_to)
        .map((cancellation) => cancellation.moved_to!)
        .reduce((acc: CalendarEvent[], newDate) => {
          return [...acc, moveEvent(parentEvent, newDate)];
        }, []),
    );
}

export async function getEvents(): Promise<CalendarEvent[]> {
  const rawEvents = await getRawEvents();

  return rawEvents
    .reduce((acc: CalendarEvent[], event: CalendarEventDTO) => {
      if (event.recurring) {
        return [...acc, ...getRecurrences(event)];
      } else {
        return [...acc, eventFromDTO(event)];
      }
    }, [])
    .sort((a, b) => {
      if (a.starts_at < b.starts_at) {
        return -1;
      }
      return 1;
    });
}