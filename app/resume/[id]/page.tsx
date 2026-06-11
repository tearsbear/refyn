"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ResumeJSON, Experience, Project } from "@/lib/types";

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
  const [viewMode, setViewMode] = useState<"preview" | "edit-form" | "edit-json">("preview");
  const [editedJSON, setEditedJSON] = useState<string>("");
  const [editedForm, setEditedForm] = useState<ResumeJSON | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleExportPDF = () => {
    window.print();
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
              <span className="text-xs text-concrete font-mono">
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
          <div className="flex gap-[24px]">
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
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <main className={`resume-container bg-white max-w-[850px] mx-auto p-[40px] my-[32px] border ${viewMode === 'preview' ? 'border-hairline shadow-subtle-2' : 'border-graphite shadow-none'} print:border-0 print:my-0 print:p-0 print:shadow-none`}>
        {viewMode === "preview" && (
          <>
            {/* Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-pure-black">
              <h1 className="text-3xl font-bold mb-2">Alifya Jiehan Anandika</h1>
              <div className="text-[11px] mt-2">
                jiehanandika@gmail.com <span className="mx-2">|</span> +62 897 6203
                842 <span className="mx-2">|</span>{" "}
                <a
                  href="https://jiaan.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline cursor-pointer"
                >
                  https://jiaan.vercel.app
                </a>{" "}
                <span className="mx-2">|</span> Jakarta, Indonesia
              </div>
              <div className="text-[11px] mt-1">
                Linkedin:{" "}
                <a
                  href="https://www.linkedin.com/in/alifyajiehan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline cursor-pointer"
                >
                  https://www.linkedin.com/in/alifyajiehan
                </a>{" "}
                <span className="mx-2">|</span> Portofolio:{" "}
                <a
                  href="https://drive.google.com/drive/folders/1EJrGrpbsj2PEfhaJssq4K-L7ljqx4JMD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline cursor-pointer"
                >
                  https://drive.google.com/drive/folders/1EJrGrpbsj2PEfhaJssq4K-L7ljqx4JMD
                </a>
              </div>
            </div>

            {/* Summary */}
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
                Summary
              </h2>
              <p className="text-[11px] leading-relaxed text-justify">
                {resume.summary}
              </p>
            </section>

            {/* Experience */}
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
                Experience
              </h2>
              {resume.experiences.map((exp: Experience, idx: number) => (
                <div key={idx} className="mb-4">
                  <div className="mb-2">
                    <h3 className="text-xs font-bold">{exp.role}</h3>
                    <div className="text-[11px] mt-0.5">
                      {exp.company} • {exp.startDate} - {exp.endDate}
                    </div>
                  </div>
                  <ul className="list-disc ml-5 space-y-1">
                    {exp.bullets.map((bullet: string, bulletIdx: number) => (
                      <li key={bulletIdx} className="text-[11px] leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            {/* Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
                  Project Experience
                </h2>
                {resume.projects.map((proj: Project, idx: number) => (
                  <div key={idx} className="mb-4">
                    <div className="mb-2">
                      <h3 className="text-xs font-bold">{proj.title}</h3>
                      <div className="text-[11px] mt-0.5">
                        {proj.company} • {proj.location} • {proj.duration}
                      </div>
                    </div>
                    <ul className="list-disc ml-5 space-y-1">
                      {proj.bullets.map((bullet: string, bulletIdx: number) => (
                        <li key={bulletIdx} className="text-[11px] leading-relaxed">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {/* Education */}
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
                Education
              </h2>
              <div className="mb-3">
                <div className="text-xs font-bold">Computer Science</div>
                <div className="text-[11px]">
                  Perbanas Institute • Jakarta, Indonesia
                </div>
              </div>
              <div className="mb-3">
                <div className="text-xs font-bold">Software Engineering</div>
                <div className="text-[11px]">
                  Vocational High School Prestasi Prima • Jakarta, Indonesia
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
                Skills
              </h2>
              <p className="text-[11px] leading-relaxed">
                {resume.skills.join(", ")}
              </p>
            </section>

            {/* Languages */}
            <section>
              <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
                Languages
              </h2>
              <p className="text-[11px]">
                Indonesian (Native), English (Professional)
              </p>
            </section>
          </>
        )}

        {viewMode === "edit-form" && editedForm && (
          <div className="space-y-[32px]">
            <div>
              <h2 className="text-xl font-semibold text-graphite mb-[8px]">Edit Form</h2>
              <p className="text-sm text-concrete">Modify your tailored resume details below. Changes are saved back to the database.</p>
            </div>

            {/* Summary */}
            <div className="space-y-[8px]">
              <label className="block text-sm font-semibold text-graphite">Summary</label>
              <textarea
                value={editedForm.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                rows={5}
                className="w-full px-[12px] py-[10px] border border-hairline rounded-inputs bg-white text-graphite placeholder:text-concrete focus:outline-none focus:border-graphite transition-colors text-sm resize-none"
              />
            </div>

            {/* Skills */}
            <div className="space-y-[8px]">
              <label className="block text-sm font-semibold text-graphite">Skills (comma-separated)</label>
              <input
                type="text"
                value={editedForm.skills.join(", ")}
                onChange={(e) => handleSkillsChange(e.target.value)}
                className="w-full px-[12px] py-[10px] border border-hairline rounded-inputs bg-white text-graphite placeholder:text-concrete focus:outline-none focus:border-graphite transition-colors text-sm cursor-pointer"
              />
            </div>

            {/* Experiences */}
            <div className="space-y-[16px]">
              <h3 className="text-base font-semibold text-graphite border-b border-hairline pb-[8px]">Work Experience</h3>
              {editedForm.experiences.map((exp, idx) => (
                <div key={idx} className="p-[16px] border border-hairline rounded-cards space-y-[12px] bg-chalk">
                  <div className="grid grid-cols-2 gap-[12px]">
                    <div className="space-y-[4px]">
                      <label className="text-xs font-semibold text-concrete">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceFieldChange(idx, "company", e.target.value)}
                        className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                      />
                    </div>
                    <div className="space-y-[4px]">
                      <label className="text-xs font-semibold text-concrete">Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExperienceFieldChange(idx, "role", e.target.value)}
                        className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-[12px]">
                    <div className="space-y-[4px]">
                      <label className="text-xs font-semibold text-concrete">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleExperienceFieldChange(idx, "startDate", e.target.value)}
                        className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                      />
                    </div>
                    <div className="space-y-[4px]">
                      <label className="text-xs font-semibold text-concrete">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => handleExperienceFieldChange(idx, "endDate", e.target.value)}
                        className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-[4px]">
                    <label className="text-xs font-semibold text-concrete">Bullets (one per line)</label>
                    <textarea
                      value={exp.bullets.join("\n")}
                      onChange={(e) => handleExperienceBulletChange(idx, e.target.value)}
                      rows={6}
                      className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Projects */}
            {editedForm.projects && editedForm.projects.length > 0 && (
              <div className="space-y-[16px]">
                <h3 className="text-base font-semibold text-graphite border-b border-hairline pb-[8px]">Projects</h3>
                {editedForm.projects.map((proj, idx) => (
                  <div key={idx} className="p-[16px] border border-hairline rounded-cards space-y-[12px] bg-chalk">
                    <div className="grid grid-cols-2 gap-[12px]">
                      <div className="space-y-[4px]">
                        <label className="text-xs font-semibold text-concrete">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleProjectFieldChange(idx, "title", e.target.value)}
                          className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                        />
                      </div>
                      <div className="space-y-[4px]">
                        <label className="text-xs font-semibold text-concrete">Company</label>
                        <input
                          type="text"
                          value={proj.company}
                          onChange={(e) => handleProjectFieldChange(idx, "company", e.target.value)}
                          className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-[12px]">
                      <div className="space-y-[4px]">
                        <label className="text-xs font-semibold text-concrete">Location</label>
                        <input
                          type="text"
                          value={proj.location}
                          onChange={(e) => handleProjectFieldChange(idx, "location", e.target.value)}
                          className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                        />
                      </div>
                      <div className="space-y-[4px]">
                        <label className="text-xs font-semibold text-concrete">Duration</label>
                        <input
                          type="text"
                          value={proj.duration}
                          onChange={(e) => handleProjectFieldChange(idx, "duration", e.target.value)}
                          className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-[4px]">
                      <label className="text-xs font-semibold text-concrete">Bullets (one per line)</label>
                      <textarea
                        value={proj.bullets.join("\n")}
                        onChange={(e) => handleProjectBulletChange(idx, e.target.value)}
                        rows={6}
                        className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-[12px] pt-[16px] border-t border-hairline">
              <button
                onClick={() => setViewMode("preview")}
                className="px-[16px] py-[8px] text-sm font-medium text-graphite hover:bg-mist rounded-buttons transition-colors cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveForm}
                disabled={isSaving}
                className="px-[16px] py-[8px] text-sm font-medium text-white bg-graphite hover:bg-carbon rounded-buttons transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {viewMode === "edit-json" && (
          <div className="space-y-[24px]">
            <div>
              <h2 className="text-xl font-semibold text-graphite mb-[8px]">Edit JSON</h2>
              <p className="text-sm text-concrete">Edit the raw JSON structure of your resume below. Ensure the syntax is valid JSON before saving.</p>
            </div>

            <div className="space-y-[8px]">
              <textarea
                value={editedJSON}
                onChange={(e) => setEditedJSON(e.target.value)}
                rows={24}
                className="w-full p-[16px] border border-hairline rounded-inputs bg-mist text-graphite font-mono text-xs focus:outline-none focus:border-graphite transition-colors resize-y"
              />
            </div>

            {/* JSON Actions */}
            <div className="flex justify-end gap-[12px] pt-[16px] border-t border-hairline">
              <button
                onClick={() => setViewMode("preview")}
                className="px-[16px] py-[8px] text-sm font-medium text-graphite hover:bg-mist rounded-buttons transition-colors cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJSON}
                disabled={isSaving}
                className="px-[16px] py-[8px] text-sm font-medium text-white bg-graphite hover:bg-carbon rounded-buttons transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}     </main>

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
