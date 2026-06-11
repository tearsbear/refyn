interface ResumeEmailViewProps {
  companyName: string;
  generatedEmail: string | undefined;
  isGeneratingEmail: boolean;
  copySuccess: boolean;
  onGenerateEmail: (force: boolean) => void;
  onCopyEmail: () => void;
}

export default function ResumeEmailView({
  companyName,
  generatedEmail,
  isGeneratingEmail,
  copySuccess,
  onGenerateEmail,
  onCopyEmail,
}: ResumeEmailViewProps) {
  return (
    <div className="space-y-[24px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] pb-[16px] border-b border-hairline">
        <div>
          <h2 className="text-xl font-semibold text-graphite">Tailored Application Email</h2>
          <p className="text-sm text-concrete">Tailored to {companyName} using your qualifications.</p>
        </div>
        {generatedEmail && (
          <div className="flex flex-wrap gap-[8px] sm:justify-end w-full sm:w-auto">
            <button
              onClick={() => onGenerateEmail(true)}
              disabled={isGeneratingEmail}
              className="px-[12px] py-[6px] text-xs font-medium text-concrete hover:text-graphite hover:bg-mist rounded-buttons transition-colors cursor-pointer focus:outline-none disabled:opacity-50 flex-1 sm:flex-none"
            >
              {isGeneratingEmail ? "Regenerating..." : "Regenerate"}
            </button>
            <button
              onClick={onCopyEmail}
              className="px-[12px] py-[6px] text-xs font-medium text-white bg-graphite hover:bg-carbon rounded-buttons transition-colors cursor-pointer focus:outline-none flex-1 sm:flex-none"
            >
              {copySuccess ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        )}
      </div>

      {isGeneratingEmail && !generatedEmail ? (
        <div className="flex items-center justify-center py-[48px]">
          <div className="text-concrete font-mono text-sm">Generating email...</div>
        </div>
      ) : generatedEmail ? (
        <div className="bg-mist p-[20px] rounded-cards border border-hairline font-sans text-sm text-graphite whitespace-pre-wrap leading-body">
          {generatedEmail}
        </div>
      ) : (
        <div className="text-center py-[48px] space-y-[16px]">
          <p className="text-concrete text-sm">No email generated for this resume yet.</p>
          <button
            onClick={() => onGenerateEmail(false)}
            disabled={isGeneratingEmail}
            className="px-[16px] py-[8px] bg-graphite text-white text-sm font-medium rounded-buttons hover:bg-carbon transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
          >
            {isGeneratingEmail ? "Generating Email..." : "Generate Email"}
          </button>
        </div>
      )}
    </div>
  );
}
