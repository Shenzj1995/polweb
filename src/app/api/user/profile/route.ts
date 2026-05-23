import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { createClient } from "@/lib/supabase/server";
import { grantCreditsOnce } from "@/lib/credits";

// GET /api/user/profile — Get user profile with credits
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Request parameter required by Next.js API route signature
export async function GET(_request: Request) {
  try {
    // Try to get user from Supabase auth first
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        plan: true,
        avatarUrl: true,
      },
    });

    // Auto-create user if not in our DB yet
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          avatarUrl: authUser.user_metadata?.avatar_url || null,
          credits: 0,
          plan: "FREE",
        },
      });

      await prisma.$transaction(async (tx) => {
        await grantCreditsOnce({
          tx,
          userId: authUser.id,
          amount: 20,
          type: "SIGNUP_BONUS",
          refId: authUser.id,
          description: "Welcome bonus — 20 free credits",
        });
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
