import Link from "next/link";

const footerLinks = {
  "Video Models": [
    { label: "Kling AI", href: "/models/kling-ai" },
    { label: "Seedance 2.0", href: "/models/seedance-2" },
    { label: "Runway Gen-3", href: "/models/runway-gen3" },
    { label: "Luma AI", href: "/models/luma-ai" },
  ],
  "Image Models": [
    { label: "FLUX Schnell", href: "/models/flux-schnell" },
    { label: "FLUX Pro", href: "/models/flux-pro" },
    { label: "Stable Diffusion", href: "/models/stable-diffusion-3" },
  ],
  Tools: [
    { label: "Text to Video", href: "/tools/text-to-video" },
    { label: "Image to Video", href: "/tools/image-to-video" },
    { label: "Text to Image", href: "/tools/text-to-image" },
  ],
  Company: [
    { label: "Pricing", href: "/pricing" },
    { label: "Explore", href: "/explore" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border/40 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AI Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
