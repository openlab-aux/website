import { readItem, readSingleton } from "@directus/sdk";
import { directusClient } from "./directus";

export interface SpaceApiDTO {
  SpaceStatus: "PUBLIC" | "MEMBERS_ONLY" | "CLOSED";
}

export interface SpaceApi {
  api_compatibility: string[];
  space: string;
  logo: string;
  url: string;
  contact: SpaceApiContact;
  state: SpaceApiState;
}

export interface SpaceApiState {
  open: boolean;
}

export interface SpaceApiContact {
  phone: string;
  mastodon: string;
  email: string;
  matrix: string;
}

export async function getSpaceApi(): Promise<SpaceApi> {
  return directusClient
    .request<SpaceApiDTO>(readSingleton("SpaceAPI"))
    .then((dto) => {
      return {
        api_compatibility: ["15"],
        space: "OpenLab Augsburg e.V.",
        url: "https://openlab-augsburg.de",
        logo: "https://raw.githubusercontent.com/openlab-aux/design/refs/heads/master/logo/png-files/logo-colour.png",
        state: {
          open: dto.SpaceStatus !== "CLOSED",
        },
        contact: {
          email: "vorstand@openlab-augsburg.de",
          phone: "+4982157089944",
          mastodon: "@OpenLabAugsburg@chaos.social",
          matrix: "#alle:matrix.openlab-augsburg.de",
        },
      };
    });
}
