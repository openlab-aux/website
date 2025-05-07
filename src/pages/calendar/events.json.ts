import type { APIRoute } from "astro";
import { getEvents } from "../../util/event";

export const GET: APIRoute = async ({ request }) => {
  return new Response(
    JSON.stringify(
      await getEvents(),
      null,
      2
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      }
    }
  )
}