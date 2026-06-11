"use client";

import { useEffect, useState } from "react";
import type { ResumeGeneration } from "@/lib/types";

export function ResumeHistory() {
  const [history, setHistory] = useState<ResumeGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/resume/history");
        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }
        const data = await response.json();
        setHistory(data.history || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      const response = await fetch(`/api/resume/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resume");
      }

      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete resume");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[48px]">
        <div className="text-concrete font-mono text-sm">
          Loading history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-[16px] border border-graphite bg-white rounded-inputs">
        <p className="text-sm text-graphite font-mono">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-[48px]">
        <p className="text-concrete mb-[8px]">No resumes generated yet</p>
        <p className="text-sm text-concrete">
          Generate your first resume to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      {history.map((resume) => (
        <div
          key={resume.id}
          className="p-[20px] border border-hairline bg-white rounded-cards hover:border-concrete transition-colors"
        >
          <div className="flex items-start justify-between mb-[16px]">
            <div>
              <h3 className="text-base font-semibold text-graphite mb-1">
                {resume.company_name}
              </h3>
              <p className="text-xs text-concrete font-mono">
                {formatDate(resume.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-[8px]">
              <a
                href={`/resume/${resume.id}`}
                className="px-[12px] py-[6px] text-sm font-medium text-graphite hover:bg-mist rounded-buttons transition-colors cursor-pointer inline-block"
              >
                View Resume
              </a>
              <button
                onClick={() => setConfirmDeleteId(resume.id)}
                disabled={deletingIds.has(resume.id)}
                className="px-[12px] py-[6px] text-sm font-medium text-white bg-swiss-red hover:bg-swiss-red-hover rounded-buttons transition-colors cursor-pointer inline-block focus:outline-none disabled:opacity-50"
              >
                {deletingIds.has(resume.id) ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          <div className="space-y-[16px]">
            <div>
              <p className="text-xs font-mono text-concrete mb-1.5">
                Job Analysis
              </p>
              <div className="flex flex-wrap gap-[8px]">
                <span className="px-[10px] py-[2px] bg-mist border border-hairline text-graphite text-xs font-medium rounded-badges">
                  {resume.analysis_json.role}
                </span>
                {resume.analysis_json.requiredSkills
                  .slice(0, 3)
                  .map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-[10px] py-[2px] bg-mist border border-hairline text-graphite text-xs font-medium rounded-badges"
                    >
                      {skill}
                    </span>
                  ))}
                {resume.analysis_json.requiredSkills.length > 3 && (
                  <span className="px-[10px] py-[2px] text-concrete text-xs font-medium">
                    +{resume.analysis_json.requiredSkills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-mono text-concrete mb-1">Summary</p>
              <p className="text-sm text-concrete leading-body line-clamp-2">
                {resume.generated_summary}
              </p>
            </div>

            <div>
              <p className="text-xs font-mono text-concrete mb-1">Model</p>
              <p className="text-xs text-concrete font-mono">
                {resume.ai_model}
              </p>
            </div>
          </div>
        </div>
      ))}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pure-black/55 backdrop-blur-[2px]">
          <div className="bg-white border border-graphite p-[24px] rounded-cards max-w-[400px] w-full mx-[16px] shadow-subtle-2">
            <h3 className="text-lg font-semibold text-graphite mb-[8px]">
              Confirm Deletion
            </h3>
            <p className="text-sm text-concrete mb-[24px]">
              Are you sure you want to delete this tailored resume? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-[12px]">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-[16px] py-[8px] text-sm font-medium text-graphite hover:bg-mist rounded-buttons transition-colors cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-[16px] py-[8px] text-sm font-medium text-white bg-swiss-red hover:bg-swiss-red-hover rounded-buttons transition-colors cursor-pointer focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
