import { NextRequest, NextResponse } from "next/server";
import { analyzeJob, tailorResume } from "@/lib/ai/client";
import { getAIProviderConfig, type AIProvider } from "@/lib/ai/config";
import { supabaseServer } from "@/lib/supabase/server";
import type { GenerateResumeInput, ResumeJSON } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateResumeInput = await request.json();
    const { companyName, companyDescription, jobDescription } = body;

    if (!companyName || !jobDescription) {
      return NextResponse.json(
        { error: "Company name and job description are required" },
        { status: 400 },
      );
    }

    // Get AI provider from body or environment
    const provider =
      (body.provider as AIProvider) ||
      (process.env.NEXT_PUBLIC_AI_PROVIDER as AIProvider) ||
      "openagentic";
    const { config } = getAIProviderConfig(provider);

    // Step 1: Load master resume from profile_data
    // For now, we'll load from the JSON file
    // TODO: Load from Supabase profile_data table
    const masterResumePath = path.join(
      process.cwd(),
      "data",
      "master-resume.json",
    );
    const masterResumeData = await fs.readFile(masterResumePath, "utf-8");
    const masterResume: ResumeJSON = JSON.parse(masterResumeData);

    // Step 2: AI Job Analysis
    console.log(`Analyzing job using ${provider}...`);
    const analysis = await analyzeJob(
      companyName,
      companyDescription,
      jobDescription,
      provider,
    );
    console.log("Job analysis complete:", analysis);

    // Step 3: AI Resume Tailoring
    console.log(`Tailoring resume using ${provider}...`);
    const tailoredResume = await tailorResume(masterResume, analysis, provider);
    console.log("Resume tailored");

    // Step 4: Save generation history (no PDF upload)
    const { data: generationData, error: insertError } = await supabaseServer
      .from("resume_generations")
      .insert({
        company_name: companyName,
        company_description: companyDescription,
        job_description: jobDescription,
        ai_model: `${provider}:${config.model}`,
        analysis_json: analysis,
        generated_resume_json: tailoredResume,
        generated_summary: tailoredResume.summary,
        pdf_path: null, // No PDF file, user exports via browser print
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(
        `Failed to save generation history: ${insertError.message}`,
      );
    }

    return NextResponse.json({
      resumeId: generationData.id,
      analysis,
      tailoredResume,
      provider,
    });
  } catch (error) {
    console.error("Error generating resume:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate resume",
      },
      { status: 500 },
    );
  }
}
