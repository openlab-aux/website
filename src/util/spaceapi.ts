import { readActivities, readItem, readSingleton } from "@directus/sdk";
import { directusClient } from "./directus";
import { DateTime } from "luxon";

export interface SpaceApiDTO {
  SpaceStatus: "PUBLIC" | "MEMBERS_ONLY" | "CLOSED";
}

export interface SpaceApi {
  api_compatibility: string[];
  api: string;
  space: string;
  logo: string;
  url: string;
  contact: SpaceApiContact;
  state: SpaceApiState;
  location: {
    address: string;
    lat: number;
    lon: number;
    timezone: string;
  };
  issue_report_channels: string[];
}

export interface SpaceApiState {
  open: boolean;
  icon: {
    open: string;
    closed: string;
  }
  lastchange: number;
}

export interface SpaceApiContact {
  phone: string;
  mastodon: string;
  email: string;
  matrix: string;
}

export async function getSpaceApi(): Promise<SpaceApi> {
  const dto = await directusClient.request<SpaceApiDTO>(readSingleton("SpaceAPI"))
  const lastchanges = await directusClient.request(readActivities({
    collection: "SpaceAPI",
    action: "update",
    fields: ["timestamp"],
    limit: 1,
    sort: ["-timestamp"],
  }))
  const lastchange_timestamp = DateTime.fromISO(lastchanges[0].timestamp).toUnixInteger();

  return {
    api: "0.13",
    api_compatibility: ["14", "15"],
    space: "OpenLab Augsburg e.V.",
    url: "https://openlab-augsburg.de",
    logo: "https://www.openlab-augsburg.de/static/logo-colour.png",
    state: {
      open: dto.SpaceStatus !== "CLOSED",
      lastchange: lastchange_timestamp,
      icon: {
        open: "https://www.openlab-augsburg.de/static/open.png",
        closed: "https://www.openlab-augsburg.de/static/closed.png",
      },
    },
    location: {
      address: "Bäckergasse 32, Augsburg, Germany",
      lat: 48.362644,
      lon: 10.902595,
      timezone: "Europe/Berlin",
    },
    contact: {
      email: "kontakt@openlab-augsburg.de",
      phone: "+4982157089944",
      mastodon: "@OpenLabAugsburg@chaos.social",
      matrix: "#alle:matrix.openlab-augsburg.de",
    },
    issue_report_channels: ["email"],
  };
}
