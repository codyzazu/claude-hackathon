import type { EvaluationResult, EvaluationStatus } from "../types";
import { ScoreCard } from "./ScoreCard";

interface Props {
  status: EvaluationStatus;
  results: EvaluationResult[];
  onRunEvaluation: () => void;
  onAutoImprove: () => void;
  improvedPrompt: string | null;
  originalPrompt: string;
}

function averageScore(results: EvaluationResult[]): number {
  if (results.length === 0) return 0;
  return Math.round(results.reduce((sum, r) => sum + r.judgment.overallScore, 0) / results.length);
}

export function ResultsDashboard({
  status,
  results,
  onRunEvaluation,
  onAutoImprove,
  improvedPrompt,
  originalPrompt,
}: Props) {
  const avg = averageScore(results);

  return (
    <div className="flex flex-col gap-6">
      {/* Action bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRunEvaluation}
          disabled={status === "loading"}
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {status === "loading" ? "Running..." : "Run Evaluation"}
        </button>

        {results.length > 0 && status !== "loading" && (
          <button
            onClick={onAutoImprove}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium transition-colors border border-gray-600"
          >
            Auto-Improve Prompt
          </button>
        )}

        {results.length > 0 && (
          <span className="ml-auto text-sm text-gray-400">
            Average score:{" "}
            <span className={`font-bold ${avg >= 80 ? "text-green-400" : avg >= 50 ? "text-yellow-400" : "text-red-400"}`}>
              {avg}/100
            </span>
          </span>
        )}
      </div>

      {/* Loading state */}
      {status === "loading" && (
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          Running test cases in parallel...
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-red-300 text-sm">
          Something went wrong. Check your API key and try again.
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((r, i) => (
            <ScoreCard key={i} result={r} />
          ))}
        </div>
      )}

      {/* Before/after diff */}
      {improvedPrompt && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-gray-300">Improved Prompt</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-red-400 font-medium uppercase tracking-wide">Before</span>
              <pre className="text-xs text-gray-400 bg-gray-900 border border-gray-700 rounded-lg p-3 whitespace-pre-wrap font-mono">
                {originalPrompt}
              </pre>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-green-400 font-medium uppercase tracking-wide">After</span>
              <pre className="text-xs text-gray-200 bg-gray-900 border border-green-800 rounded-lg p-3 whitespace-pre-wrap font-mono">
                {improvedPrompt}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
