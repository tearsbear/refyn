"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const resumeFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyDescription: z.string().optional(),
  jobDescription: z.string().min(1, "Job description is required"),
});

type ResumeFormData = z.infer<typeof resumeFormSchema>;

interface ResumeFormProps {
  onSuccess?: () => void;
  provider: "openagentic" | "bluesminds";
}

export function ResumeForm({ onSuccess, provider }: ResumeFormProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
  });

  const onSubmit = async (data: ResumeFormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          provider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate resume");
      }

      const resultData = await response.json();
      reset();
      onSuccess?.();

      // Redirect to resume preview page
      router.push(`/resume/${resultData.resumeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[24px]">
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-graphite mb-[8px]"
          >
            Company Name *
          </label>
          <input
            id="companyName"
            type="text"
            {...register("companyName")}
            className="w-full px-[12px] py-[10px] border border-hairline rounded-inputs bg-white text-graphite placeholder:text-concrete focus:outline-none focus:border-graphite transition-colors text-sm"
            placeholder="e.g., OpenAI"
            disabled={isGenerating}
          />
          {errors.companyName && (
            <p className="mt-[6px] text-xs text-concrete">
              {errors.companyName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="companyDescription"
            className="block text-sm font-medium text-graphite mb-[8px]"
          >
            Company Description
          </label>
          <textarea
            id="companyDescription"
            {...register("companyDescription")}
            rows={4}
            className="w-full px-[12px] py-[10px] border border-hairline rounded-inputs bg-white text-graphite placeholder:text-concrete focus:outline-none focus:border-graphite transition-colors resize-none text-sm"
            placeholder="Brief description of the company and what they do..."
            disabled={isGenerating}
          />
        </div>

        <div>
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium text-graphite mb-[8px]"
          >
            Job Description *
          </label>
          <textarea
            id="jobDescription"
            {...register("jobDescription")}
            rows={12}
            className="w-full px-[12px] py-[10px] border border-hairline rounded-inputs bg-white text-graphite placeholder:text-concrete focus:outline-none focus:border-graphite transition-colors resize-none text-sm"
            placeholder="Paste the full job description here..."
            disabled={isGenerating}
          />
          {errors.jobDescription && (
            <p className="mt-[6px] text-xs text-concrete">
              {errors.jobDescription.message}
            </p>
          )}
        </div>

        {error && (
          <div className="p-[16px] border border-graphite bg-white rounded-inputs">
            <p className="text-sm text-graphite font-mono">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-[12px] px-[16px] bg-graphite text-white text-sm font-medium rounded-buttons hover:bg-carbon disabled:bg-ash disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isGenerating ? "Generating Resume..." : "Generate Resume"}
        </button>
      </form>
    </div>
  );
}
