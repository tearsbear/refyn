import type { ResumeJSON, Experience, Project } from "@/lib/types";

interface ResumeEditFormProps {
  editedForm: ResumeJSON;
  isSaving: boolean;
  onSummaryChange: (text: string) => void;
  onSkillsChange: (text: string) => void;
  onExperienceFieldChange: (idx: number, field: keyof Experience, value: string) => void;
  onExperienceBulletChange: (idx: number, text: string) => void;
  onProjectFieldChange: (idx: number, field: keyof Project, value: string) => void;
  onProjectBulletChange: (idx: number, text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ResumeEditForm({
  editedForm,
  isSaving,
  onSummaryChange,
  onSkillsChange,
  onExperienceFieldChange,
  onExperienceBulletChange,
  onProjectFieldChange,
  onProjectBulletChange,
  onSave,
  onCancel,
}: ResumeEditFormProps) {
  return (
    <div className="space-y-[32px]">
      <div>
        <h2 className="text-xl font-semibold text-graphite mb-[8px]">Edit Form</h2>
        <p className="text-sm text-concrete">
          Modify your tailored resume details below. Changes are saved back to the database.
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-[8px]">
        <label className="block text-sm font-semibold text-graphite">Summary</label>
        <textarea
          value={editedForm.summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          rows={5}
          className="w-full px-[12px] py-[10px] border border-hairline rounded-inputs bg-white text-graphite placeholder:text-concrete focus:outline-none focus:border-graphite transition-colors text-sm resize-none"
        />
      </div>

      {/* Skills */}
      <div className="space-y-[8px]">
        <label className="block text-sm font-semibold text-graphite">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          value={editedForm.skills.join(", ")}
          onChange={(e) => onSkillsChange(e.target.value)}
          className="w-full px-[12px] py-[10px] border border-hairline rounded-inputs bg-white text-graphite placeholder:text-concrete focus:outline-none focus:border-graphite transition-colors text-sm cursor-pointer"
        />
      </div>

      {/* Experiences */}
      <div className="space-y-[16px]">
        <h3 className="text-base font-semibold text-graphite border-b border-hairline pb-[8px]">
          Work Experience
        </h3>
        {editedForm.experiences.map((exp, idx) => (
          <div
            key={idx}
            className="p-[16px] border border-hairline rounded-cards space-y-[12px] bg-chalk"
          >
            <div className="grid grid-cols-2 gap-[12px]">
              <div className="space-y-[4px]">
                <label className="text-xs font-semibold text-concrete">Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => onExperienceFieldChange(idx, "company", e.target.value)}
                  className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                />
              </div>
              <div className="space-y-[4px]">
                <label className="text-xs font-semibold text-concrete">Role</label>
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => onExperienceFieldChange(idx, "role", e.target.value)}
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
                  onChange={(e) => onExperienceFieldChange(idx, "startDate", e.target.value)}
                  className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                />
              </div>
              <div className="space-y-[4px]">
                <label className="text-xs font-semibold text-concrete">End Date</label>
                <input
                  type="text"
                  value={exp.endDate}
                  onChange={(e) => onExperienceFieldChange(idx, "endDate", e.target.value)}
                  className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                />
              </div>
            </div>
            <div className="space-y-[4px]">
              <label className="text-xs font-semibold text-concrete">
                Bullets (one per line)
              </label>
              <textarea
                value={exp.bullets.join("\n")}
                onChange={(e) => onExperienceBulletChange(idx, e.target.value)}
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
          <h3 className="text-base font-semibold text-graphite border-b border-hairline pb-[8px]">
            Projects
          </h3>
          {editedForm.projects.map((proj, idx) => (
            <div
              key={idx}
              className="p-[16px] border border-hairline rounded-cards space-y-[12px] bg-chalk"
            >
              <div className="grid grid-cols-2 gap-[12px]">
                <div className="space-y-[4px]">
                  <label className="text-xs font-semibold text-concrete">Project Title</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => onProjectFieldChange(idx, "title", e.target.value)}
                    className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                  />
                </div>
                <div className="space-y-[4px]">
                  <label className="text-xs font-semibold text-concrete">Company</label>
                  <input
                    type="text"
                    value={proj.company}
                    onChange={(e) => onProjectFieldChange(idx, "company", e.target.value)}
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
                    onChange={(e) => onProjectFieldChange(idx, "location", e.target.value)}
                    className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                  />
                </div>
                <div className="space-y-[4px]">
                  <label className="text-xs font-semibold text-concrete">Duration</label>
                  <input
                    type="text"
                    value={proj.duration}
                    onChange={(e) => onProjectFieldChange(idx, "duration", e.target.value)}
                    className="w-full px-[10px] py-[8px] border border-hairline rounded-inputs text-sm"
                  />
                </div>
              </div>
              <div className="space-y-[4px]">
                <label className="text-xs font-semibold text-concrete">
                  Bullets (one per line)
                </label>
                <textarea
                  value={proj.bullets.join("\n")}
                  onChange={(e) => onProjectBulletChange(idx, e.target.value)}
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
          onClick={onCancel}
          className="px-[16px] py-[8px] text-sm font-medium text-graphite hover:bg-mist rounded-buttons transition-colors cursor-pointer focus:outline-none"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-[16px] py-[8px] text-sm font-medium text-white bg-graphite hover:bg-carbon rounded-buttons transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
