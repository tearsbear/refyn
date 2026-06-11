import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("resume_generations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch history: ${error.message}`);
    }

    return NextResponse.json({ history: data });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch history",
      },
      { status: 500 },
    );
  }
}
