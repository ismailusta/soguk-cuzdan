import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Görsel/video açıklaması (erişilebilirlik).",
      },
    },
  ],
  upload: {
    // Hero + ürün: WebP/AVIF/GIF + MP4/WebM
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ],
    // Videos aren't images — skip crop/focal UI noise
    crop: false,
    focalPoint: false,
  },
};
