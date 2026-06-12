"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ResumeJSON, Experience, Project } from "@/lib/types";
import ResumePreview from "@/components/ResumePreview";
import ResumeEditForm from "@/components/ResumeEditForm";
import ResumeEditJSON from "@/components/ResumeEditJSON";
import ResumeEmailView from "@/components/ResumeEmailView";
import ResumeQuestionView from "@/components/ResumeQuestionView";

export default function ResumePreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const [resumeData, setResumeData] = useState<{
    companyName: string;
    resume: ResumeJSON;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "edit-form" | "edit-json" | "email" | "Question">("preview");
  const [editedJSON, setEditedJSON] = useState<string>("");
  const [editedForm, setEditedForm] = useState<ResumeJSON | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGeneratingQuestionId, setIsGeneratingQuestionId] = useState<string | null>(null);
  const shouldPrintRef = useRef(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(`/api/resume/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch resume");
        }
        const data = await response.json();
        setResumeData({
          companyName: data.resume.company_name,
          resume: data.resume.generated_resume_json,
        });
        setEditedForm(data.resume.generated_resume_json);
        setEditedJSON(JSON.stringify(data.resume.generated_resume_json, null, 2));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  useEffect(() => {
    if (resumeData?.companyName) {
      const originalTitle = document.title;
      document.title = `${resumeData.companyName}_JiehanAnandika_Resume`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [resumeData]);

  useEffect(() => {
    if (viewMode === "preview" && shouldPrintRef.current) {
      shouldPrintRef.current = false;
      const timer = setTimeout(() => {
        window.print();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  const handleExportPDF = () => {
    if (viewMode === "preview") {
      window.print();
    } else {
      shouldPrintRef.current = true;
      setViewMode("preview");
    }
  };

  const handleRegenerate = async () => {
    if (!resumeData) return;
    setShowConfirmModal(false);
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/resume/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to regenerate resume");
      }

      const data = await response.json();
      setResumeData({
        companyName: resumeData.companyName,
        resume: data.tailoredResume,
      });
      setEditedForm(data.tailoredResume);
      setEditedJSON(JSON.stringify(data.tailoredResume, null, 2));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to regenerate resume");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = async (updatedResume: ResumeJSON) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/resume/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resume: updatedResume }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save changes");
      }

      const data = await response.json();
      setResumeData({
        companyName: resumeData?.companyName || "",
        resume: data.tailoredResume,
      });
      setEditedForm(data.tailoredResume);
      setEditedJSON(JSON.stringify(data.tailoredResume, null, 2));
      setViewMode("preview");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveJSON = () => {
    try {
      const parsed = JSON.parse(editedJSON);
      if (!parsed.summary || !Array.isArray(parsed.experiences) || !Array.isArray(parsed.projects) || !Array.isArray(parsed.skills)) {
        throw new Error("Invalid resume format. JSON must have summary, experiences, projects, and skills fields.");
      }
      handleSave(parsed);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Invalid JSON syntax. Please correct it before saving.");
    }
  };

  const handleSaveForm = () => {
    if (editedForm) {
      handleSave(editedForm);
    }
  };

  const handleSummaryChange = (text: string) => {
    setEditedForm(prev => {
      if (!prev) return prev;
      return { ...prev, summary: text };
    });
  };

  const handleSkillsChange = (text: string) => {
    const skillsArray = text.split(",").map(s => s.trim());
    setEditedForm(prev => {
      if (!prev) return prev;
      return { ...prev, skills: skillsArray };
    });
  };

  const handleExperienceFieldChange = (idx: number, field: keyof Experience, value: string) => {
    setEditedForm(prev => {
      if (!prev) return prev;
      const updatedExperiences = [...prev.experiences];
      updatedExperiences[idx] = {
        ...updatedExperiences[idx],
        [field]: value
      } as Experience;
      return { ...prev, experiences: updatedExperiences };
    });
  };

  const handleExperienceBulletChange = (idx: number, text: string) => {
    const updatedBullets = text.split("\n");
    setEditedForm(prev => {
      if (!prev) return prev;
      const updatedExperiences = [...prev.experiences];
      updatedExperiences[idx] = {
        ...updatedExperiences[idx],
        bullets: updatedBullets
      };
      return { ...prev, experiences: updatedExperiences };
    });
  };

  const handleProjectFieldChange = (idx: number, field: keyof Project, value: string) => {
    setEditedForm(prev => {
      if (!prev) return prev;
      const updatedProjects = [...prev.projects];
      updatedProjects[idx] = {
        ...updatedProjects[idx],
        [field]: value
      } as Project;
      return { ...prev, projects: updatedProjects };
    });
  };

  const handleProjectBulletChange = (idx: number, text: string) => {
    const updatedBullets = text.split("\n");
    setEditedForm(prev => {
      if (!prev) return prev;
      const updatedProjects = [...prev.projects];
      updatedProjects[idx] = {
        ...updatedProjects[idx],
        bullets: updatedBullets
      };
      return { ...prev, projects: updatedProjects };
    });
  };

  const handleGenerateEmail = async (force: boolean = false) => {
    setIsGeneratingEmail(true);
    try {
      const response = await fetch(`/api/resume/${id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate email");
      }

      const data = await response.json();
      setResumeData(prev => {
        if (!prev) return prev;
        const updatedResume = {
          ...prev.resume,
          generated_email: data.email,
        };
        return {
          ...prev,
          resume: updatedResume,
        };
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    if (!resumeData?.resume.generated_email) return;
    navigator.clipboard.writeText(resumeData.resume.generated_email).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleAddQuestion = async () => {
    if (!resumeData) return;
    const newQuestionId = Math.random().toString(36).substring(2, 11);
    const currentQuestions = resumeData.resume.application_questions || [];
    const updatedQuestions = [...currentQuestions, { id: newQuestionId, question: "" }];
    
    setResumeData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        resume: {
          ...prev.resume,
          application_questions: updatedQuestions,
        }
      };
    });

    try {
      await fetch(`/api/resume/${id}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save",
          questionId: newQuestionId,
          questionText: "",
        }),
      });
    } catch (err) {
      console.error("Failed to add question:", err);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!resumeData) return;
    const currentQuestions = resumeData.resume.application_questions || [];
    const updatedQuestions = currentQuestions.filter(q => q.id !== questionId);
    
    setResumeData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        resume: {
          ...prev.resume,
          application_questions: updatedQuestions,
        }
      };
    });

    try {
      await fetch(`/api/resume/${id}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          questionId,
        }),
      });
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  };

  const handleGenerateQuestion = async (questionId: string, questionText: string) => {
    if (!resumeData || !questionText.trim()) return;
    setIsGeneratingQuestionId(questionId);

    try {
      const response = await fetch(`/api/resume/${id}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate",
          questionId,
          questionText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate answer");
      }

      const data = await response.json();
      setResumeData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          resume: {
            ...prev.resume,
            application_questions: data.questions,
          }
        };
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate answer");
    } finally {
      setIsGeneratingQuestionId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-chalk flex items-center justify-center">
        <div className="text-concrete font-mono text-sm">Loading resume...</div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-[100dvh] bg-chalk flex items-center justify-center">
        <div className="text-center">
          <p className="text-concrete mb-[8px]">Failed to load resume</p>
          <p className="text-sm text-concrete font-mono">{error}</p>
        </div>
      </div>
    );
  }

  const { resume, companyName } = resumeData;

  return (
    <>
      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.4in;
            size: A4;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .no-print {
            display: none !important;
          }

          .resume-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Navigation - hidden in print */}
      <nav className="no-print border-b border-hairline bg-white sticky top-0 z-10">
        <div className="max-w-[1200px] w-full mx-auto px-[16px] sm:px-[24px] lg:px-[32px]">
          <div className="flex items-center justify-between h-[64px]">
            <div className="flex items-center gap-[16px]">
              <Link
                href="/"
                className="flex items-center gap-[8px] hover:opacity-70 transition-opacity cursor-pointer"
              >
                <h1 className="text-sm font-semibold tracking-tight text-graphite">
                  Refyn
                </h1>
              </Link>
              <span className="text-sm text-concrete">•</span>
              <span className="text-xs text-concrete font-mono truncate max-w-[100px] sm:max-w-none">
                {companyName}
              </span>
            </div>
            <div className="flex items-center gap-[12px]">
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isRegenerating}
                className="px-[16px] py-[8px] text-sm font-medium text-concrete hover:text-graphite hover:bg-mist rounded-buttons transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
              >
                {isRegenerating ? "Regenerating..." : "Regenerate"}
              </button>
              <button
                onClick={handleExportPDF}
                className="px-[16px] py-[8px] bg-graphite text-white text-sm font-medium rounded-buttons hover:bg-carbon transition-colors cursor-pointer focus:outline-none"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </nav>      {/* Sub navigation viewMode tabs - hidden in print */}
      <div className="no-print border-b border-hairline bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-[16px] sm:px-[24px] lg:px-[32px]">
          <div className="flex gap-[24px] overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setViewMode("preview")}
              className={`pb-[12px] pt-[16px] border-b-2 transition-colors font-sans text-sm font-medium tracking-tight cursor-pointer focus:outline-none ${
                viewMode === "preview"
                  ? "border-graphite text-graphite"
                  : "border-transparent text-concrete hover:text-graphite"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode("edit-form")}
              className={`pb-[12px] pt-[16px] border-b-2 transition-colors font-sans text-sm font-medium tracking-tight cursor-pointer focus:outline-none ${
                viewMode === "edit-form"
                  ? "border-graphite text-graphite"
                  : "border-transparent text-concrete hover:text-graphite"
              }`}
            >
              Edit Form
            </button>
            <button
              onClick={() => setViewMode("edit-json")}
              className={`pb-[12px] pt-[16px] border-b-2 transition-colors font-sans text-sm font-medium tracking-tight cursor-pointer focus:outline-none ${
                viewMode === "edit-json"
                  ? "border-graphite text-graphite"
                  : "border-transparent text-concrete hover:text-graphite"
              }`}
            >
              Edit JSON
            </button>
            <button
              onClick={() => setViewMode("email")}
              className={`pb-[12px] pt-[16px] border-b-2 transition-colors font-sans text-sm font-medium tracking-tight cursor-pointer focus:outline-none ${
                viewMode === "email"
                  ? "border-graphite text-graphite"
                  : "border-transparent text-concrete hover:text-graphite"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setViewMode("Question")}
              className={`pb-[12px] pt-[16px] border-b-2 transition-colors font-sans text-sm font-medium tracking-tight cursor-pointer focus:outline-none ${
                viewMode === "Question"
                  ? "border-graphite text-graphite"
                  : "border-transparent text-concrete hover:text-graphite"
              }`}
            >
              Question
            </button>
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <main className={`resume-container bg-white max-w-[850px] mx-auto p-[16px] sm:p-[40px] my-[16px] sm:my-[32px] border ${viewMode === 'preview' ? 'border-hairline shadow-subtle-2' : 'border-graphite shadow-none'} print:border-0 print:my-0 print:p-0 print:shadow-none`}>
        {viewMode === "preview" && (
          <ResumePreview resume={resume} />
        )}

        {viewMode === "edit-form" && editedForm && (
          <ResumeEditForm
            editedForm={editedForm}
            isSaving={isSaving}
            onSummaryChange={handleSummaryChange}
            onSkillsChange={handleSkillsChange}
            onExperienceFieldChange={handleExperienceFieldChange}
            onExperienceBulletChange={handleExperienceBulletChange}
            onProjectFieldChange={handleProjectFieldChange}
            onProjectBulletChange={handleProjectBulletChange}
            onSave={handleSaveForm}
            onCancel={() => setViewMode("preview")}
          />
        )}

        {viewMode === "edit-json" && (
          <ResumeEditJSON
            editedJSON={editedJSON}
            isSaving={isSaving}
            setEditedJSON={setEditedJSON}
            onSave={handleSaveJSON}
            onCancel={() => setViewMode("preview")}
          />
        )}

        {viewMode === "email" && (
          <ResumeEmailView
            companyName={companyName}
            generatedEmail={resume.generated_email}
            isGeneratingEmail={isGeneratingEmail}
            copySuccess={copySuccess}
            onGenerateEmail={handleGenerateEmail}
            onCopyEmail={handleCopyEmail}
          />
        )}

        {viewMode === "Question" && (
          <ResumeQuestionView
            questions={resume.application_questions || []}
            isGeneratingId={isGeneratingQuestionId}
            onGenerateQuestion={handleGenerateQuestion}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        )}
      </main>

      <div className="no-print text-center py-8 text-sm text-concrete">
        <p>Click &quot;Export PDF&quot; to save this resume as a PDF file</p>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pure-black/55 backdrop-blur-[2px]">
          <div className="bg-white border border-graphite p-[24px] rounded-cards max-w-[400px] w-full mx-[16px] shadow-subtle-2">
            <h3 className="text-lg font-semibold text-graphite mb-[8px]">
              Regenerate Resume
            </h3>
            <p className="text-sm text-concrete mb-[24px]">
              Are you sure you want to regenerate this resume? This will invoke
              the AI model again and replace the current tailored version.
            </p>
            <div className="flex justify-end gap-[12px]">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-[16px] py-[8px] text-sm font-medium text-graphite hover:bg-mist rounded-buttons transition-colors cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                className="px-[16px] py-[8px] text-sm font-medium text-white bg-graphite hover:bg-carbon rounded-buttons transition-colors cursor-pointer focus:outline-none"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
