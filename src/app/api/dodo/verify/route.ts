import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/db";

// POST /api/dodo/verify — Sync user plan after checkout
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, credits: true },
    });

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify" },
      { status: 500 },
    );
  }
}
