import type { APIRoute } from "astro";
import { getSpaceApi } from "../../util/spaceapi";

export const GET: APIRoute = async ({ request }) => {
  return getSpaceApi().then((result) => {
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  });
};
