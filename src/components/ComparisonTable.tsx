import type { ModelEvaluationResult } from "../types";

interface Props {
  comparisons: ModelEvaluationResult[];
}

function scoreColor(score: number): string {
  if (score >= 80) return "#00ff41";
  if (score >= 60) return "#fbbf24";
  return "#ff4444";
}

function avgScore(results: ModelEvaluationResult["results"]): number {
  if (results.length === 0) return 0;
  return Math.round(results.reduce((s, r) => s + r.judgment.overallScore, 0) / results.length);
}

export function ComparisonTable({ comparisons }: Props) {
  if (comparisons.length === 0) return null;

  // Collect all unique test cases (preserve order from first model)
  const testCases = comparisons[0].results.map((r) => r.testCase);

  return (
    <div
      className="overflow-x-auto"
      style={{ border: "1px solid #2a2a2a", borderRadius: "4px" }}
    >
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
            <th
              className="text-left px-4 py-3 text-xs tracking-widest font-normal"
              style={{ color: "#6b6b6b", minWidth: "200px" }}
            >
              TEST CASE
            </th>
            {comparisons.map((c) => (
              <th
                key={c.model.id}
                className="px-4 py-3 text-xs tracking-widest font-normal text-center"
                style={{ color: "#6b6b6b", minWidth: "120px" }}
              >
                {c.model.label.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {testCases.map((tc, i) => (
            <tr
              key={i}
              style={{ borderBottom: "1px solid #1e1e1e" }}
            >
              <td className="px-4 py-3 text-xs" style={{ color: "#6b6b6b" }}>
                → {tc.length > 60 ? tc.slice(0, 60) + "…" : tc}
              </td>
              {comparisons.map((c) => {
                const result = c.results[i];
                const score = result?.judgment.overallScore ?? 0;
                return (
                  <td key={c.model.id} className="px-4 py-3 text-center">
                    <span className="font-bold text-base" style={{ color: scoreColor(score) }}>
                      {score}
                    </span>
                    <span className="text-xs ml-0.5" style={{ color: "#6b6b6b" }}>/100</span>
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Average row */}
          <tr style={{ borderTop: "1px solid #2a2a2a", background: "rgba(0,255,65,0.03)" }}>
            <td className="px-4 py-3 text-xs font-bold" style={{ color: "#00ff41" }}>
              overall_avg
            </td>
            {comparisons.map((c) => {
              const avg = avgScore(c.results);
              return (
                <td key={c.model.id} className="px-4 py-3 text-center">
                  <span className="font-bold text-lg" style={{ color: scoreColor(avg) }}>
                    {avg}
                  </span>
                  <span className="text-xs ml-0.5" style={{ color: "#6b6b6b" }}>/100</span>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
