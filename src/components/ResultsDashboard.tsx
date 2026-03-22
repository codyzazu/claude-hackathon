import type { ModelEvaluationResult, EvaluationStatus } from "../types";
import { ScoreCard } from "./ScoreCard";
import { ComparisonTable } from "./ComparisonTable";

interface Props {
  status: EvaluationStatus;
  comparisons: ModelEvaluationResult[];
  improvedPrompt: string | null;
  originalPrompt: string;
}

interface CriterionAggregate {
  attempts: number;
  passes: number;
  scoreTotal: number;
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsvCell(value: string | number | boolean): string {
  const text = String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function exportAsJson(comparisons: ModelEvaluationResult[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    modelCount: comparisons.length,
    comparisons,
  };

  downloadTextFile(
    `prompt-eval-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.json`,
    JSON.stringify(payload, null, 2),
    "application/json"
  );
}

function exportAsCsv(comparisons: ModelEvaluationResult[]) {
  const rows: Array<Array<string | number | boolean>> = [[
    "model",
    "test_case",
    "overall_score",
    "criterion",
    "criterion_score",
    "pass",
    "reasoning",
    "response",
  ]];

  comparisons.forEach((comparison) => {
    comparison.results.forEach((result) => {
      result.judgment.results.forEach((criterionResult) => {
        rows.push([
          comparison.model.label,
          result.testCase,
          result.judgment.overallScore,
          criterionResult.criterion,
          criterionResult.score,
          criterionResult.pass,
          criterionResult.reasoning,
          result.response,
        ]);
      });
    });
  });

  const csv = rows.map((row) => row.map(toCsvCell).join(",")).join("\n");
  downloadTextFile(
    `prompt-eval-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.csv`,
    csv,
    "text/csv;charset=utf-8"
  );
}

function buildCriterionBreakdown(
  comparisons: ModelEvaluationResult[]
): { criteria: string[]; byModel: Record<string, Record<string, CriterionAggregate>> } {
  const allCriteria = new Set<string>();
  const byModel: Record<string, Record<string, CriterionAggregate>> = {};

  comparisons.forEach((comparison) => {
    const modelMap: Record<string, CriterionAggregate> = {};
    comparison.results.forEach((result) => {
      result.judgment.results.forEach((row) => {
        allCriteria.add(row.criterion);
        if (!modelMap[row.criterion]) {
          modelMap[row.criterion] = { attempts: 0, passes: 0, scoreTotal: 0 };
        }
        modelMap[row.criterion].attempts += 1;
        if (row.pass) modelMap[row.criterion].passes += 1;
        modelMap[row.criterion].scoreTotal += row.score;
      });
    });
    byModel[comparison.model.id] = modelMap;
  });

  return { criteria: Array.from(allCriteria), byModel };
}

export function ResultsDashboard({ status, comparisons, improvedPrompt, originalPrompt }: Props) {
  if (status === "idle") {
    return (
      <p className="text-sm" style={{ color: "#6b6b6b" }}>
        — fill in a prompt, test cases, and criteria, then run eval
      </p>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 text-sm" style={{ color: "#6b6b6b" }}>
        <div
          className="w-3 h-3 rounded-full border-2 animate-spin"
          style={{ borderColor: "#00ff41", borderTopColor: "transparent" }}
        />
        running models in parallel...
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

  const multiModel = comparisons.length > 1;
  const breakdown = buildCriterionBreakdown(comparisons);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => exportAsJson(comparisons)}
          className="text-xs px-2.5 py-1 rounded transition-opacity hover:opacity-70"
          style={{ color: "#00ff41", border: "1px solid #2a2a2a" }}
        >
          export JSON
        </button>
        <button
          type="button"
          onClick={() => exportAsCsv(comparisons)}
          className="text-xs px-2.5 py-1 rounded transition-opacity hover:opacity-70"
          style={{ color: "#00ff41", border: "1px solid #2a2a2a" }}
        >
          export CSV
        </button>
      </div>

      {/* Comparison table — always shown when results exist */}
      <ComparisonTable comparisons={comparisons} />

      <div className="flex flex-col gap-2">
        <p className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>
          CRITERION PASS RATE / AVG SCORE
        </p>
        <div className="overflow-x-auto" style={{ border: "1px solid #2a2a2a", borderRadius: "4px" }}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                <th className="text-left px-3 py-2 tracking-widest font-normal" style={{ color: "#6b6b6b", minWidth: "240px" }}>
                  CRITERION
                </th>
                {comparisons.map((c) => (
                  <th
                    key={c.model.id}
                    className="px-3 py-2 tracking-widest font-normal"
                    style={{ color: "#6b6b6b", minWidth: "170px" }}
                  >
                    {c.model.label.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breakdown.criteria.map((criterion) => (
                <tr key={criterion} style={{ borderBottom: "1px solid #1e1e1e" }}>
                  <td className="px-3 py-2" style={{ color: "#00ff41" }}>
                    {criterion}
                  </td>
                  {comparisons.map((c) => {
                    const agg = breakdown.byModel[c.model.id]?.[criterion];
                    if (!agg) {
                      return (
                        <td key={`${c.model.id}:${criterion}`} className="px-3 py-2 text-center" style={{ color: "#555" }}>
                          -
                        </td>
                      );
                    }

                    const passRate = Math.round((agg.passes / agg.attempts) * 100);
                    const avgScore = (agg.scoreTotal / agg.attempts).toFixed(2);

                    return (
                      <td key={`${c.model.id}:${criterion}`} className="px-3 py-2 text-center">
                        <span style={{ color: passRate >= 70 ? "#00ff41" : "#ff4444" }}>{passRate}% pass</span>
                        <span style={{ color: "#6b6b6b" }}> | avg {avgScore}/5</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-model ScoreCards for detailed pass/fail context */}
      {comparisons.map((comparison) => {
        const openByDefault = !multiModel;
        return (
          <details key={comparison.model.id} open={openByDefault}>
            <summary
              className="text-xs cursor-pointer py-1 hover:opacity-70 transition-opacity"
              style={{ color: "#6b6b6b" }}
            >
              {comparison.model.label.toLowerCase()} detailed breakdown ({comparison.results.length} test case(s))
            </summary>
            <div className="mt-3 flex flex-col gap-4">
              {comparison.results.map((r, i) => (
                <ScoreCard key={`${comparison.model.id}:${i}`} result={r} />
              ))}
            </div>
          </details>
        );
      })}

      {/* Before/after diff */}
      {improvedPrompt && (
        <div className="flex flex-col gap-3">
          <p className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>IMPROVED PROMPT</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs" style={{ color: "#ff4444" }}>BEFORE</span>
              <pre
                className="text-xs p-4 whitespace-pre-wrap"
                style={{ background: "#1a1a1a", color: "#6b6b6b", border: "1px solid #2a2a2a", borderRadius: "4px" }}
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
