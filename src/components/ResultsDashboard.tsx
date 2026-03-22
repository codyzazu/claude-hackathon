import type { EvaluationResult, EvaluationStatus } from "../types";
import { ScoreCard } from "./ScoreCard";

interface Props {
  status: EvaluationStatus;
  results: EvaluationResult[];
  improvedPrompt: string | null;
  originalPrompt: string;
}

export function ResultsDashboard({ status, results, improvedPrompt, originalPrompt }: Props) {
  if (status === "idle") {
    return (
      <p className="text-sm" style={{ color: "#6b6b6b" }}>
        — fill in a prompt, test cases, and criteria, then run eval
      </p>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 text-sm" style={{ color: "#7a7a7a" }}>
        <div
          className="w-3 h-3 rounded-full border-2 animate-spin"
          style={{ borderColor: "#00ff41", borderTopColor: "transparent" }}
        />
        running test cases in parallel...
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm" style={{ color: "#ff4444" }}>
        ✗ error — check your API key and try again
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {results.map((r, i) => (
        <ScoreCard key={i} result={r} />
      ))}

      {improvedPrompt && (
        <div className="flex flex-col gap-3">
          <p className="text-xs tracking-[0.2em]" style={{ color: "#7a7a7a" }}>IMPROVED PROMPT</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs" style={{ color: "#ff4444" }}>BEFORE</span>
              <pre
                className="text-xs p-4 whitespace-pre-wrap"
                style={{ background: "#1a1a1a", color: "#666", border: "1px solid #2a2a2a", borderRadius: "4px" }}
              >
                {originalPrompt}
              </pre>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs" style={{ color: "#00ff41" }}>AFTER</span>
              <pre
                className="text-xs p-4 whitespace-pre-wrap"
                style={{ background: "#1a1a1a", color: "#00ff41", border: "1px solid #00ff41", borderRadius: "4px" }}
              >
                {improvedPrompt}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
