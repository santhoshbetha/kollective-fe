import punycode from "punycode";

import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";

import { groupSchema } from "./group.js";

const IDNA_PREFIX = "xn--";

const cardSchema = z
  .object({
    author_name: z.string().catch(""),
    author_url: z.string().url().catch(""),
    blurhash: z.string().nullable().catch(null),
    description: z.string().catch(""),
    embed_url: z.string().url().catch(""),
    group: groupSchema.nullable().catch(null),
    height: z.number().catch(0),
    html: z.string().catch(""),
    image: z.string().nullable().catch(null),
    kollective: z
      .object({
        opengraph: z
          .object({
            width: z.number(),
            height: z.number(),
            html: z.string(),
            thumbnail_url: z.string().url(),
          })
          .optional()
          .catch(undefined),
      })
      .optional()
      .catch(undefined),
    provider_name: z.string().catch(""),
    provider_url: z.string().url().catch(""),
    title: z.string().catch(""),
    type: z.enum(["link", "photo", "video", "rich"]).catch("link"),
    url: z.string().url(),
    width: z.number().catch(0),
  })
 .transform((data) => {
    // 1. Shallow copy to avoid mutation
    const { kollective, ...card } = data;
    const result = { ...card };

    // 2. Logic Fallbacks
    if (!result.provider_name) {
      try {
        result.provider_name = decodeIDNA(new URL(result.url).hostname);
      } catch {
        result.provider_name = "";
      }
    }

    if (kollective?.opengraph) {
      result.width = result.width || kollective.opengraph.width;
      result.height = result.height || kollective.opengraph.height;
      result.html = result.html || kollective.opengraph.html;
      result.image = result.image || kollective.opengraph.thumbnail_url;
    }

    // 3. Sanitization logic
    // Using a simpler approach: sanitize the string, then modify if needed
    const cleanHtmlStr = DOMPurify.sanitize(result.html, {
      ALLOWED_TAGS: ["iframe"],
      ALLOWED_ATTR: ["src", "width", "height", "frameborder", "allowfullscreen"],
    });

    // Check if we are in a browser environment before using DOMParser
    if (typeof window !== "undefined" && cleanHtmlStr) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanHtmlStr, "text/html");
      const iframes = doc.querySelectorAll("iframe");

      iframes.forEach((frame) => {
        try {
          const src = new URL(frame.src);
          const isUnsafe = src.protocol !== "https:" || (typeof location !== 'undefined' && src.origin === location.origin);
          
          if (isUnsafe) {
            frame.remove();
          } else {
            frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation");
          }
        } catch {
          frame.remove();
        }
      });
      result.html = doc.body.innerHTML;
    } else {
      result.html = cleanHtmlStr;
    }

    // 4. Final Type Check
    if (!result.html && result.type !== "photo") {
      result.type = "link";
    }

    return result;
  })

const decodeIDNA = (domain) => {
  return domain
    .split(".")
    .map((part) =>
      part.indexOf(IDNA_PREFIX) === 0
        ? punycode.decode(part.slice(IDNA_PREFIX.length))
        : part,
    )
    .join(".");
};

export { cardSchema };

