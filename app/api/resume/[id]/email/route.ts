import { NextRequest, NextResponse } from "next/server";
import { generateEmail } from "@/lib/ai/client";
import { supabaseServer } from "@/lib/supabase/server";
import { type AIProvider } from "@/lib/ai/config";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // Fetch the existing record
    const { data: existing, error: fetchError } = await supabaseServer
      .from("resume_generations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const resumeJson = existing.generated_resume_json;

    // Check if email already exists and we are not forcing regeneration
    if (resumeJson.generated_email && !body.force) {
      return NextResponse.json({ email: resumeJson.generated_email });
    }

    // Determine provider from existing record
    let provider: AIProvider = "openagentic";
    if (existing.ai_model) {
      const parts = existing.ai_model.split(":");
      if (parts[0] === "openagentic" || parts[0] === "bluesminds") {
        provider = parts[0] as AIProvider;
      }
    }

    // Generate new email
    const email = await generateEmail(
      existing.company_name,
      existing.job_description,
      resumeJson,
      provider,
    );

    // Save generated email back inside generated_resume_json in Supabase
    const updatedResumeJson = {
      ...resumeJson,
      generated_email: email,
    };

    const { error: updateError } = await supabaseServer
      .from("resume_generations")
      .update({
        generated_resume_json: updatedResumeJson,
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(`Failed to save email to database: ${updateError.message}`);
    }

    return NextResponse.json({ email });
  } catch (error) {
    console.error("Error generating application email:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate application email",
      },
      { status: 500 },
    );
  }
}
