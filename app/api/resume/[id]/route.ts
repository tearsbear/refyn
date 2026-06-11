import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { analyzeJob, tailorResume } from "@/lib/ai/client";
import { getAIProviderConfig, type AIProvider } from "@/lib/ai/config";
import type { ResumeJSON } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseServer
      .from("resume_generations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch resume: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ resume: data });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch resume",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { error } = await supabaseServer
      .from("resume_generations")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete resume: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete resume",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // If body has resume data, it is a SAVE EDIT request
    if (body.resume) {
      const { data: updatedData, error: updateError } = await supabaseServer
        .from("resume_generations")
        .update({
          generated_resume_json: body.resume,
          generated_summary: body.resume.summary,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to save resume edits: ${updateError.message}`);
      }

      return NextResponse.json({
        success: true,
        resumeId: updatedData.id,
        tailoredResume: updatedData.generated_resume_json,
      });
    }

    // Fetch the existing record to get inputs
    const { data: existing, error: fetchError } = await supabaseServer
      .from("resume_generations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const companyName = existing.company_name;
    const companyDescription = existing.company_description;
    const jobDescription = existing.job_description;

    // Determine provider: first check request body, then existing record model, then fallback
    let provider: AIProvider = "openagentic";
    if (body.provider) {
      provider = body.provider as AIProvider;
    } else if (existing.ai_model) {
      const parts = existing.ai_model.split(":");
      if (parts[0] === "openagentic" || parts[0] === "bluesminds") {
        provider = parts[0] as AIProvider;
      }
    }

    const { config } = getAIProviderConfig(provider);

    // Load master resume
    const masterResumePath = path.join(
      process.cwd(),
      "data",
      "master-resume.json",
    );
    const masterResumeData = await fs.readFile(masterResumePath, "utf-8");
    const masterResume: ResumeJSON = JSON.parse(masterResumeData);

    // AI Job Analysis
    console.log(`Regenerating: Analyzing job using ${provider}...`);
    const analysis = await analyzeJob(
      companyName,
      companyDescription,
      jobDescription,
      provider,
    );

    // AI Resume Tailoring
    console.log(`Regenerating: Tailoring resume using ${provider}...`);
    const tailoredResume = await tailorResume(masterResume, analysis, provider);

    // Update existing generation history in-place
    const { data: updatedData, error: updateError } = await supabaseServer
      .from("resume_generations")
      .update({
        ai_model: `${provider}:${config.model}`,
        analysis_json: analysis,
        generated_resume_json: tailoredResume,
        generated_summary: tailoredResume.summary,
        created_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update resume: ${updateError.message}`);
    }

    return NextResponse.json({
      resumeId: updatedData.id,
      analysis,
      tailoredResume,
      provider,
    });
  } catch (error) {
    console.error("Error regenerating resume:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to regenerate resume",
      },
      { status: 500 },
    );
  }
}
