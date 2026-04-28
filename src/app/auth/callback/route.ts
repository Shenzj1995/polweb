import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/db";
import { grantCreditsOnce } from "@/lib/credits";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/generate";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Get user info from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatarUrl: user.user_metadata?.avatar_url || null,
          },
          create: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatarUrl: user.user_metadata?.avatar_url || null,
            credits: 0,
            plan: "FREE",
          },
        });

        await grantCreditsOnce({
          tx,
          userId: user.id,
          amount: 20,
          type: "SIGNUP_BONUS",
          refId: user.id,
          description: "Welcome bonus — 20 free credits",
        });
      });
    } catch (err) {
      console.error("User sync error:", err);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
