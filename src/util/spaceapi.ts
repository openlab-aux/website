import { readItem, readSingleton } from "@directus/sdk";
import { directusClient } from "./directus";

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
        api: "0.13",
        api_compatibility: ["14", "15"],
        space: "OpenLab Augsburg e.V.",
        url: "https://openlab-augsburg.de",
        logo: "https://cms.openlab-augsburg.de/assets/f500c2b9-8df1-4cce-bc95-65db756cb351.png",
        state: {
          open: dto.SpaceStatus !== "CLOSED",
          icon: {
            open: "https://cms.openlab-augsburg.de/assets/5acb8735-aef6-434b-afae-7d51fc1ebdd5.png",
            closed:
              "https://cms.openlab-augsburg.de/assets/c62c0dac-cc57-4c1e-b111-93c3b80fe3cb.png",
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
    });
}
