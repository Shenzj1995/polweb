export const siteConfig = {
  name: "AI Studio",
  description: "All-in-one AI video and image generation platform. Create stunning videos and images with the best AI models.",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000",
  ogImage: "/og/default.png",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com",
  links: {
    twitter: "https://twitter.com/yourstudio",
    github: "https://github.com/yourstudio",
  },
};
