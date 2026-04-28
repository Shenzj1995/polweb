import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { createClient } from "@/lib/supabase/server";
import { grantCreditsOnce } from "@/lib/credits";

// POST /api/user/sync — Create/update user in our DB after Supabase auth
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = body.name ?? authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null;
    const avatarUrl = body.avatarUrl ?? authUser.user_metadata?.avatar_url ?? null;

    const user = await prisma.$transaction(async (tx) => {
      const synced = await tx.user.upsert({
        where: { id: authUser.id },
        update: {
          email: authUser.email!,
          name,
          avatarUrl,
        },
        create: {
          id: authUser.id,
          email: authUser.email!,
          name,
          avatarUrl,
          credits: 0,
          plan: "FREE",
        },
      });

      await grantCreditsOnce({
        tx,
        userId: authUser.id,
        amount: 20,
        type: "SIGNUP_BONUS",
        refId: authUser.id,
        description: "Welcome bonus — 20 free credits",
      });

      return synced;
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
