import rss from "@astrojs/rss";
import { getBlogPosts } from "../util/blog";
import type { BlogPost } from "../util/blog";

export async function GET() {
  const blogPosts = await getBlogPosts();
  return rss({
    // `<title>` field in output xml
    title: "OpenLab Augsburg e.V. - Blog",
    description: "Blog des Vereins",
    site: "https:/openlab-augsburg.de",
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: blogPosts.map((post: BlogPost) => ({
      title: post.title,
      pubDate: post.createdAt,
      description: post.subtitle,
      link: "/blogposts/{post.slug}",
    })),
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  });
}