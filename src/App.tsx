import { useState } from "react";
import { nanoid } from "nanoid";
import type { TestCase, Criterion, EvaluationResult, EvaluationStatus } from "./types";
import { runEvaluation, autoImprovePrompt } from "./services/claude";
import { PromptSetup } from "./components/PromptSetup";
import { TestCaseList } from "./components/TestCaseList";
import { CriteriaBuilder } from "./components/CriteriaBuilder";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { CommandPalette } from "./components/CommandPalette";

export default function App() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [status, setStatus] = useState<EvaluationStatus>("idle");
  const [improvedPrompt, setImprovedPrompt] = useState<string | null>(null);

  function handleAddTestCase() {
    setTestCases((prev) => [...prev, { id: nanoid(), input: "" }]);
  }
  function handleUpdateTestCase(id: string, input: string) {
    setTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, input } : tc)));
  }
  function handleRemoveTestCase(id: string) {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
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

  async function handleRunEvaluation() {
    if (!systemPrompt.trim() || testCases.length === 0 || criteria.length === 0) return;
    setStatus("loading");
    setImprovedPrompt(null);
    try {
      const evalResults = await runEvaluation(systemPrompt, testCases, criteria);
      setResults(evalResults);
      setStatus("complete");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  async function handleAutoImprove() {
    if (results.length === 0) return;
    setStatus("loading");
    try {
      const improved = await autoImprovePrompt(systemPrompt, results);
      setImprovedPrompt(improved);
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

  const canImprove = status !== "loading" && results.length > 0;

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

      {/* Title bar */}
      <div className="flex items-center justify-end px-6 pt-5 pb-4">
        <span className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>
          PROMPT-EVAL-STUDIO V1.0
        </span>
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
            />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>TEST CASES</p>
            <TestCaseList
              testCases={testCases}
              onAddTestCase={handleAddTestCase}
              onUpdateTestCase={handleUpdateTestCase}
              onRemoveTestCase={handleRemoveTestCase}
            />
          </div>
        </div>

        {/* Row 2: Criteria */}
        <div className="flex flex-col gap-3">
          <p className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>CRITERIA</p>
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
            results={results}
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

        <div className="flex items-center gap-3">
          {status === "loading" && (
            <span className="text-xs animate-pulse" style={{ color: "#6b6b6b" }}>running...</span>
          )}
          <button
            onClick={canImprove ? handleAutoImprove : handleRunEvaluation}
            disabled={status === "loading" || (!canRun && !canImprove)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:opacity-80"
            style={{
              background: "transparent",
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
