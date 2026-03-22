import type { EvaluationResult } from "../types";

interface Props {
  result: EvaluationResult;
}

function barColor(score: number): string {
  if (score >= 80) return "#00ff41";
  if (score >= 50) return "#fbbf24";
  return "#ff4444";
}

export function ScoreCard({ result }: Props) {
  const { testCase, response, judgment } = result;
  const score = judgment.overallScore;

  return (
    <div
      className="flex flex-col gap-4 p-5"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px" }}
    >
      {/* Test case label */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "#7a7a7a" }}>
        <span>→</span>
        <span className="truncate" style={{ color: "#00ff41" }}>{testCase}</span>
      </div>

      {/* Overall score row */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm" style={{ color: "#00ff41" }}>overall_score</span>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold" style={{ color: barColor(score) }}>{score}</span>
          <span className="text-sm" style={{ color: "#7a7a7a" }}>/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 rounded-full" style={{ background: "#2a2a2a" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: barColor(score) }}
        />
      </div>

      {/* Criteria rows */}
      <div className="flex flex-col" style={{ borderTop: "1px solid #2a2a2a" }}>
        {judgment.results.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 text-sm gap-4"
            style={{ borderBottom: "1px solid #1e1e1e" }}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span style={{ color: "#00ff41" }}>{r.criterion}</span>
              <span className="text-xs truncate" style={{ color: "#6b6b6b" }}>{r.reasoning}</span>
            </div>
            <span
              className="shrink-0 font-bold tracking-widest text-xs"
              style={{ color: r.pass ? "#00ff41" : "#ff4444" }}
            >
              {r.pass ? "✓ PASS" : "✗ FAIL"}
            </span>
          </div>
        ))}
      </div>

      {/* Response preview */}
      <details>
        <summary className="text-xs cursor-pointer hover:opacity-70 transition-opacity" style={{ color: "#6b6b6b" }}>
          view response
        </summary>
        <pre
          className="mt-3 p-3 text-xs whitespace-pre-wrap"
          style={{ background: "#111", color: "#00cc33", borderRadius: "4px" }}
        >
          {response}
        </pre>
      </details>
    </div>
  );
}
