import { useState } from "react";
import { nanoid } from "nanoid";
import type {
  TestCase,
  Criterion,
  ModelEvaluationResult,
  EvaluationStatus,
  ReferenceFile,
} from "./types";
import { runEvaluation, autoImprovePrompt } from "./services/claude";
import { PromptSetup } from "./components/PromptSetup";
import { TestCaseList } from "./components/TestCaseList";
import { CriteriaBuilder } from "./components/CriteriaBuilder";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { CommandPalette } from "./components/CommandPalette";
import { ModelSelector, MODELS } from "./components/ModelSelector";
import { PromptHistory } from "./components/PromptHistory";
import { usePromptHistory } from "./hooks/usePromptHistory";
import { CriteriaTemplates } from "./components/CriteriaTemplates";
import { HelpDialog } from "./components/HelpDialog";

const DEFAULT_MODEL_ID = "claude-sonnet-4-20250514";

function avgScore(comparisons: ModelEvaluationResult[]): number {
  if (comparisons.length === 0) return 0;
  const allScores = comparisons.flatMap((c) => c.results.map((r) => r.judgment.overallScore));
  return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
}

export default function App() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([DEFAULT_MODEL_ID]);
  const [comparisons, setComparisons] = useState<ModelEvaluationResult[]>([]);
  const [status, setStatus] = useState<EvaluationStatus>("idle");
  const [improvedPrompt, setImprovedPrompt] = useState<string | null>(null);
  const [improveModelId, setImproveModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const { versions, addVersion, clear } = usePromptHistory();

  function handleAddTestCase() {
    setTestCases((prev) => [...prev, { id: nanoid(), input: "" }]);
  }
  function handleUpdateTestCase(id: string, input: string) {
    setTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, input } : tc)));
  }
  function handleRemoveTestCase(id: string) {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  }

  function handleAddStarterTestCases() {
    const starterInputs = [
      "User asks: How do I reset my password?",
      "User says: I was charged twice this month.",
      "User asks: Can I export my data before canceling?",
    ];

    setTestCases((prev) => {
      const existing = new Set(prev.map((t) => t.input.trim().toLowerCase()));
      const toAdd = starterInputs
        .filter((input) => !existing.has(input.trim().toLowerCase()))
        .map((input) => ({ id: nanoid(), input }));
      return [...prev, ...toAdd];
    });
  }

  function handleAddCriterion() {
    setCriteria((prev) => [...prev, { id: nanoid(), text: "", weight: 3 }]);
  }
  function handleUpdateCriterion(id: string, field: "text" | "weight", value: string | number) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }
  function handleRemoveCriterion(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }

  function handleLoadTemplate(newCriteria: Criterion[]) {
    setCriteria(newCriteria);
  }

  function handleAddReferenceFiles(files: File[]) {
    if (files.length === 0) return;

    setReferenceFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}:${f.size}:${f.type}`));
      const additions: ReferenceFile[] = [];

      files.forEach((file) => {
        const key = `${file.name}:${file.size}:${file.type}`;
        if (seen.has(key)) return;
        seen.add(key);
        additions.push({
          id: nanoid(),
          name: file.name,
          size: file.size,
          type: file.type,
        });
      });

      return [...prev, ...additions];
    });
  }

  function handleRemoveReferenceFile(id: string) {
    setReferenceFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleRunEvaluation() {
    if (!systemPrompt.trim() || testCases.length === 0 || criteria.length === 0) return;
    setStatus("loading");
    setImprovedPrompt(null);
    try {
      const selectedModels = MODELS.filter((m) => selectedModelIds.includes(m.id));
      const allResults = await Promise.all(
        selectedModels.map(async (model) => ({
          model,
          results: await runEvaluation(systemPrompt, testCases, criteria, model.id),
        }))
      );
      setComparisons(allResults);
      setImproveModelId(selectedModels[0].id);

      // Save to history (v1 on first run, new version on subsequent runs)
      addVersion(systemPrompt, avgScore(allResults));

      setStatus("complete");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  async function handleAutoImprove() {
    const chosen = comparisons.find((c) => c.model.id === improveModelId) ?? comparisons[0];
    const chosenResults = chosen?.results;
    if (!chosenResults?.length) return;
    setStatus("loading");
    try {
      const improved = await autoImprovePrompt(systemPrompt, chosenResults);
      setImprovedPrompt(improved);

      // Save the improved prompt with the current score (score of what prompted the improve)
      addVersion(improved, avgScore(comparisons));

      setStatus("complete");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  const canRun =
    status !== "loading" &&
    systemPrompt.trim().length > 0 &&
    testCases.length > 0 &&
    criteria.length > 0;

  const canImprove = status !== "loading" && comparisons.length > 0;

  function openCommandPalette() {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ color: "#00ff41" }}>
      <CommandPalette
        onRunEvaluation={handleRunEvaluation}
        onAddTestCase={handleAddTestCase}
        onAddCriterion={handleAddCriterion}
        onAutoImprove={handleAutoImprove}
        canRun={canRun}
        canImprove={canImprove}
      />

      <PromptHistory
        versions={versions}
        currentPrompt={systemPrompt}
        onRestore={setSystemPrompt}
        onClear={clear}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Title bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <button
          onClick={() => setHistoryOpen(true)}
          className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
          style={{ color: versions.length > 0 ? "#6b6b6b" : "#333" }}
        >
          <span>◎</span>
          history
          {versions.length > 0 && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: "rgba(0,255,65,0.1)", color: "#00ff41", border: "1px solid rgba(0,255,65,0.2)" }}
            >
              {versions.length}
            </span>
          )}
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setHelpOpen(true)}
            className="text-xs px-2.5 py-1 rounded transition-opacity hover:opacity-70"
            style={{ border: "1px solid #2a2a2a", color: "#6b6b6b" }}
          >
            help
          </button>
          <span className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>
            PROMPT-EVAL-STUDIO V1.0
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 pb-28 flex flex-col gap-8">

        {/* Row 1: System Prompt + Test Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>SYSTEM PROMPT</p>
            <PromptSetup
              systemPrompt={systemPrompt}
              onSystemPromptChange={setSystemPrompt}
              referenceFiles={referenceFiles}
              onAddReferenceFiles={handleAddReferenceFiles}
              onRemoveReferenceFile={handleRemoveReferenceFile}
            />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>TEST CASES</p>
            <TestCaseList
              testCases={testCases}
              onAddTestCase={handleAddTestCase}
              onAddStarterExamples={handleAddStarterTestCases}
              onUpdateTestCase={handleUpdateTestCase}
              onRemoveTestCase={handleRemoveTestCase}
            />
          </div>
        </div>

        {/* Row 2: Criteria */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>CRITERIA</p>
            <CriteriaTemplates
              onLoad={handleLoadTemplate}
              onReset={() => setCriteria([])}
              hasCriteria={criteria.length > 0}
            />
          </div>
          <CriteriaBuilder
            criteria={criteria}
            onAddCriterion={handleAddCriterion}
            onUpdateCriterion={handleUpdateCriterion}
            onRemoveCriterion={handleRemoveCriterion}
          />
        </div>

        {/* Row 3: Results */}
        <div className="flex flex-col gap-3">
          <p className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>EVALUATION RESULTS</p>
          <ResultsDashboard
            status={status}
            comparisons={comparisons}
            improvedPrompt={improvedPrompt}
            originalPrompt={systemPrompt}
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4"
        style={{ background: "#0a0a0a", borderTop: "1px solid #222" }}
      >
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
          style={{ color: "#6b6b6b" }}
        >
          <span className="border px-1.5 py-0.5 rounded text-xs" style={{ borderColor: "#2a2a2a", color: "#6b6b6b" }}>⌘K</span>
          command palette
        </button>

        <div className="flex items-center gap-4">
          <ModelSelector selectedIds={selectedModelIds} onChange={setSelectedModelIds} />

          {canImprove && comparisons.length > 1 && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#6b6b6b" }}>
              <span>improve using</span>
              {comparisons.map((c) => (
                <button
                  key={c.model.id}
                  onClick={() => setImproveModelId(c.model.id)}
                  className="px-2 py-1 rounded transition-all"
                  style={{
                    border: `1px solid ${improveModelId === c.model.id ? "#00ff41" : "#2a2a2a"}`,
                    color: improveModelId === c.model.id ? "#00ff41" : "#6b6b6b",
                    background: improveModelId === c.model.id ? "rgba(0,255,65,0.08)" : "transparent",
                  }}
                >
                  {c.model.label}
                </button>
              ))}
            </div>
          )}

          {status === "loading" && (
            <span className="text-xs animate-pulse" style={{ color: "#6b6b6b" }}>running...</span>
          )}
          <button
            onClick={canImprove ? handleAutoImprove : handleRunEvaluation}
            disabled={status === "loading" || (!canRun && !canImprove)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:opacity-80"
            style={{
              background: "#0a0a0a",
              color: "#00ff41",
              border: "2px solid #00ff41",
            }}
          >
            <span>✦</span>
            {canImprove ? "AUTO-IMPROVE" : "RUN EVAL"}
          </button>
        </div>
      </div>
    </div>
  );
}
