"use client";

import { useState } from "react";
import { ResumeForm } from "@/components/ResumeForm";
import { ResumeHistory } from "@/components/ResumeHistory";

type AIProvider = "openagentic" | "bluesminds";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"generate" | "history">(
    "generate",
  );
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [provider, setProvider] = useState<AIProvider>(
    (process.env.NEXT_PUBLIC_AI_PROVIDER as AIProvider) || "openagentic",
  );

  const handleGenerateSuccess = () => {
    setRefreshHistory((prev) => prev + 1);
    setActiveTab("history");
  };

  return (
    <div className="min-h-[100dvh] bg-chalk">
      <nav className="border-b border-hairline bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-[16px] sm:px-[24px] lg:px-[32px]">
          <div className="flex items-center justify-between h-[64px]">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold tracking-tight text-graphite">
                Refyn
              </h1>
            </div>
            <div className="flex items-center gap-[16px]">
              <div className="flex items-center gap-[8px]">
                <span className="text-xs font-mono uppercase tracking-wider text-concrete">
                  AI Provider:
                </span>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as AIProvider)}
                  className="px-[12px] py-[6px] text-xs font-mono uppercase tracking-wider border border-hairline rounded-inputs bg-white text-graphite focus:outline-none focus:border-graphite transition-colors cursor-pointer"
                >
                  <option value="openagentic">OpenAgentic</option>
                  <option value="bluesminds">BluesMinds</option>
                </select>
              </div>
              <p className="text-xs text-concrete font-mono hidden sm:block">
                AI Resume Tailor
              </p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-[16px] sm:px-[24px] lg:px-[32px] py-[48px]">
        <div className="mb-[32px]">
          <div className="inline-flex items-center mb-[16px]">
            <span className="px-[12px] py-[2px] bg-mist text-graphite text-[12px] font-medium rounded-badges border border-hairline tracking-tight">
              Transform your resume
            </span>
          </div>
          <h2 className="text-4xl md:text-display font-semibold tracking-display text-graphite leading-display mb-[16px]">
            Tailor your resume for any company
          </h2>
          <p className="text-sm text-concrete leading-body max-w-[65ch]">
            Generate company-specific resumes that maintain factual accuracy
            while optimizing for relevance. Every bullet is rewritten, no
            achievements are invented.
          </p>
        </div>

        <div className="border-b border-hairline mb-[32px]">
          <div className="flex gap-[24px]">
            <button
              onClick={() => setActiveTab("generate")}
              className={`pb-[12px] border-b-2 transition-colors font-sans text-sm font-medium tracking-tight cursor-pointer focus:outline-none ${
                activeTab === "generate"
                  ? "border-graphite text-graphite"
                  : "border-transparent text-concrete hover:text-graphite"
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-[12px] border-b-2 transition-colors font-sans text-sm font-medium tracking-tight cursor-pointer focus:outline-none ${
                activeTab === "history"
                  ? "border-graphite text-graphite"
                  : "border-transparent text-concrete hover:text-graphite"
              }`}
            >
              History
            </button>
          </div>
        </div>

        {activeTab === "generate" && (
          <ResumeForm onSuccess={handleGenerateSuccess} provider={provider} />
        )}

        {activeTab === "history" && <ResumeHistory key={refreshHistory} />}
      </main>
    </div>
  );
}
