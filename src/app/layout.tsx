import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/supabase/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Studio - AI Video & Image Generator",
    template: "%s | AI Studio",
  },
  description:
    "All-in-one AI video and image generation platform. Create stunning videos and images with Kling AI, Runway, FLUX, and more.",
  alternates: {
    canonical: "https://polzj.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
