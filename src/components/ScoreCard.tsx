import type { EvaluationResult } from "../types";

interface Props {
  result: EvaluationResult;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function ScoreCard({ result }: Props) {
  const { testCase, response, judgment } = result;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col gap-4">
      {/* Header: test case input + overall score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Test Case</span>
          <p className="text-sm text-gray-200">{testCase}</p>
        </div>
        <div className="shrink-0 flex flex-col items-center">
          <span className={`text-3xl font-bold ${scoreColor(judgment.overallScore)}`}>
            {judgment.overallScore}
          </span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${scoreBarColor(judgment.overallScore)}`}
          style={{ width: `${judgment.overallScore}%` }}
        />
      </div>

      {/* Per-criterion results */}
      <div className="flex flex-col gap-2">
        {judgment.results.map((r, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className={`mt-0.5 shrink-0 ${r.pass ? "text-green-400" : "text-red-400"}`}>
              {r.pass ? "✓" : "✗"}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-300 font-medium">{r.criterion}</span>
              <span className="text-gray-500 text-xs">{r.reasoning}</span>
            </div>
            <span className="ml-auto shrink-0 text-xs text-gray-500">{r.score}/5</span>
          </div>
        ))}
      </div>

      {/* Response preview */}
      <details className="group">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors select-none">
          View response
        </summary>
        <p className="mt-2 text-xs text-gray-400 bg-gray-800 rounded p-3 whitespace-pre-wrap font-mono">
          {response}
        </p>
      </details>
    </div>
  );
}
