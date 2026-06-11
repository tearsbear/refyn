import { NextRequest, NextResponse } from "next/server";
import { generateAnswerForQuestion } from "@/lib/ai/client";
import { supabaseServer } from "@/lib/supabase/server";
import { type AIProvider } from "@/lib/ai/config";
import type { ApplicationQuestion } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { action, questionId, questionText } = body;

    if (!action || !questionId) {
      return NextResponse.json(
        { error: "Missing required fields (action, questionId)" },
        { status: 400 },
      );
    }

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
    const currentQuestions: ApplicationQuestion[] = resumeJson.application_questions || [];

    let updatedQuestions: ApplicationQuestion[] = [...currentQuestions];

    if (action === "generate") {
      if (!questionText) {
        return NextResponse.json(
          { error: "Missing questionText for generation" },
          { status: 400 },
        );
      }

      // Determine provider from existing record
      let provider: AIProvider = "openagentic";
      if (existing.ai_model) {
        const parts = existing.ai_model.split(":");
        if (parts[0] === "openagentic" || parts[0] === "bluesminds") {
          provider = parts[0] as AIProvider;
        }
      }

      // Generate answer
      const answer = await generateAnswerForQuestion(
        existing.company_name,
        existing.job_description,
        resumeJson,
        questionText,
        provider,
      );

      // Upsert the question details in the local list
      const idx = updatedQuestions.findIndex((q) => q.id === questionId);
      if (idx !== -1) {
        updatedQuestions[idx] = {
          ...updatedQuestions[idx],
          question: questionText,
          answer,
        };
      } else {
        updatedQuestions.push({
          id: questionId,
          question: questionText,
          answer,
        });
      }
    } else if (action === "delete") {
      updatedQuestions = updatedQuestions.filter((q) => q.id !== questionId);
    } else if (action === "save") {
      // Just save the question text changes (without generating an answer yet)
      const idx = updatedQuestions.findIndex((q) => q.id === questionId);
      if (idx !== -1) {
        updatedQuestions[idx] = {
          ...updatedQuestions[idx],
          question: questionText || "",
        };
      } else {
        updatedQuestions.push({
          id: questionId,
          question: questionText || "",
        });
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Save back to database
    const updatedResumeJson = {
      ...resumeJson,
      application_questions: updatedQuestions,
    };

    const { error: updateError } = await supabaseServer
      .from("resume_generations")
      .update({
        generated_resume_json: updatedResumeJson,
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(`Failed to update database: ${updateError.message}`);
    }

    return NextResponse.json({ questions: updatedQuestions });
  } catch (error) {
    console.error("Error in question API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process question request",
      },
      { status: 500 },
    );
  }
}
