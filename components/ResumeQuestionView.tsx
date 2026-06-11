import { useState } from "react";
import type { ApplicationQuestion } from "@/lib/types";

interface ResumeQuestionViewProps {
  questions: ApplicationQuestion[];
  isGeneratingId: string | null;
  onGenerateQuestion: (id: string, text: string) => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (id: string) => void;
}

export default function ResumeQuestionView({
  questions,
  isGeneratingId,
  onGenerateQuestion,
  onAddQuestion,
  onDeleteQuestion,
}: ResumeQuestionViewProps) {
  // Local state for question textareas to prevent typing lag
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  const handleTextChange = (id: string, text: string) => {
    setInputs((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  const handleCopy = (id: string, answer: string) => {
    navigator.clipboard.writeText(answer).then(() => {
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 2000);
    });
  };

  const lastQuestion = questions[questions.length - 1];
  const canAddAnother = lastQuestion && !!lastQuestion.answer;

  return (
    <div className="space-y-[32px]">
      <div>
        <h2 className="text-xl font-semibold text-graphite mb-[8px]">Application Questions</h2>
        <p className="text-sm text-concrete">
          Input specific application questions to generate answers tailored to your qualifications and
          experience.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-[48px] border border-dashed border-hairline rounded-cards bg-chalk space-y-[16px]">
          <p className="text-concrete text-sm">No questions added yet.</p>
          <button
            onClick={onAddQuestion}
            className="px-[16px] py-[8px] bg-graphite text-white text-sm font-medium rounded-buttons hover:bg-carbon transition-colors cursor-pointer focus:outline-none"
          >
            Add First Question
          </button>
        </div>
      ) : (
        <div className="relative border-l border-hairline ml-[16px] pl-[32px] space-y-[48px]">
          {questions.map((q, idx) => {
            const stepNumber = String(idx + 1).padStart(2, "0");
            const isGenerating = isGeneratingId === q.id;
            const currentText = inputs[q.id] !== undefined ? inputs[q.id] : (q.question || "");

            return (
              <div key={q.id} className="relative group">
                {/* Timeline Step Node */}
                <div className="absolute left-[-45px] top-[0px] w-[26px] h-[26px] bg-white border border-graphite rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-graphite shadow-sm select-none">
                  {stepNumber}
                </div>

                <div className="space-y-[16px]">
                  {/* Card wrapper */}
                  <div className="border border-hairline p-[20px] rounded-cards bg-white space-y-[16px] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-concrete">
                        QUESTION {stepNumber}
                      </span>
                      <button
                        onClick={() => onDeleteQuestion(q.id)}
                        className="px-[8px] py-[4px] text-xs font-medium text-swiss-red hover:bg-swiss-red/10 rounded-buttons transition-colors cursor-pointer focus:outline-none"
                      >
                        Delete Step
                      </button>
                    </div>

                    <div className="space-y-[8px]">
                      <label className="block text-xs font-semibold text-concrete">
                        Question Text
                      </label>
                      <textarea
                        value={currentText}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        placeholder="e.g. Tell me about a time when you had to manage conflicting requirements from stakeholders."
                        rows={3}
                        className="w-full px-[12px] py-[10px] border border-hairline rounded-inputs bg-white text-graphite placeholder:text-concrete focus:outline-none focus:border-graphite transition-colors text-sm resize-y"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => onGenerateQuestion(q.id, currentText)}
                        disabled={isGenerating || !currentText.trim()}
                        className="px-[16px] py-[8px] bg-graphite text-white text-sm font-medium rounded-buttons hover:bg-carbon transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
                      >
                        {isGenerating ? "Generating Answer..." : q.answer ? "Regenerate Answer" : "Generate Answer"}
                      </button>
                    </div>
                  </div>

                  {/* Answer Box */}
                  {isGenerating && !q.answer && (
                    <div className="bg-mist p-[20px] rounded-cards border border-hairline border-dashed flex items-center justify-center py-[32px]">
                      <span className="text-concrete font-mono text-xs animate-pulse">
                        Analyzing resume and crafting response...
                      </span>
                    </div>
                  )}

                  {q.answer && (
                    <div className="space-y-[8px]">
                      <div className="flex items-center justify-between px-[4px]">
                        <span className="text-xs font-mono font-semibold text-concrete">
                          GENERATED ANSWER
                        </span>
                        <button
                          onClick={() => handleCopy(q.id, q.answer || "")}
                          className="px-[10px] py-[4px] text-xs font-medium text-concrete hover:text-graphite hover:bg-mist rounded-buttons transition-colors cursor-pointer focus:outline-none"
                        >
                          {copySuccessId === q.id ? "Copied!" : "Copy Answer"}
                        </button>
                      </div>
                      <div className="bg-mist p-[20px] rounded-cards border border-hairline font-sans text-sm text-graphite whitespace-pre-wrap leading-body">
                        {q.answer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Another Question Button */}
          {canAddAnother && (
            <div className="pt-[16px]">
              <button
                onClick={onAddQuestion}
                className="px-[20px] py-[10px] border border-graphite text-graphite text-sm font-semibold rounded-buttons hover:bg-mist transition-colors cursor-pointer focus:outline-none flex items-center gap-[8px]"
              >
                <span>+</span> Add Another Question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
