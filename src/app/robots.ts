import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://polzj.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/generate", "/history", "/assets", "/billing"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
