import { DateTime, type DateObjectUnits } from "luxon";
import { directusClient } from "./directus";
import { readItems } from "@directus/sdk";
import { getSecret } from "astro:env/server";

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  banner?: string;
  externalUrl: string;
}

export interface BlogPostDTO {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  date_created: DateTime;
  date_updated: DateTime;
  banner?: string;
}

export async function getRawBlogPosts(): Promise<BlogPostDTO[]> {
  const res = (await directusClient.request(
    readItems("Blog", {
      filter: {
        status: { _eq: "published" },
      },
    }),
  )) as BlogPostDTO[];

  return res;
}

function blogFromDTO(blogPost: BlogPostDTO): BlogPost {
  return {
    id: blogPost.id,
    title: blogPost.title,
    subtitle: blogPost.subtitle,
    slug: blogPost.slug,
    content: blogPost.content,
    createdAt: blogPost.date_created,
    updatedAt: blogPost.date_updated,
    banner: blogPost.banner
      ? `${getSecret("DIRECTUS_URL")}/assets/${blogPost.banner}`
      : undefined,
    externalUrl: `/blogposts/${blogPost.slug}`,
  };
}
export async function getBlogPosts(): Promise<BlogPost[]> {
  const blogPosts = await getRawBlogPosts();

  return blogPosts
    .map((post) => blogFromDTO(post))
    .sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return -1;
      }
      return 1;
    });
}
