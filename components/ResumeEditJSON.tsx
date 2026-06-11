interface ResumeEditJSONProps {
  editedJSON: string;
  isSaving: boolean;
  setEditedJSON: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ResumeEditJSON({
  editedJSON,
  isSaving,
  setEditedJSON,
  onSave,
  onCancel,
}: ResumeEditJSONProps) {
  return (
    <div className="space-y-[24px]">
      <div>
        <h2 className="text-xl font-semibold text-graphite mb-[8px]">Edit JSON</h2>
        <p className="text-sm text-concrete">
          Edit the raw JSON structure of your resume below. Ensure the syntax is valid JSON before
          saving.
        </p>
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
