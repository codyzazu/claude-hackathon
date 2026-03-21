import { useState } from "react";
import { nanoid } from "nanoid";
import type { TestCase, Criterion, EvaluationResult, EvaluationStatus } from "./types";
import { runEvaluation, autoImprovePrompt } from "./services/claude";
import { PromptSetup } from "./components/PromptSetup";
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

  // --- Test case handlers ---
  function handleAddTestCase() {
    setTestCases((prev) => [...prev, { id: nanoid(), input: "" }]);
  }

  function handleUpdateTestCase(id: string, input: string) {
    setTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, input } : tc)));
  }

  function handleRemoveTestCase(id: string) {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  }

  // --- Criteria handlers ---
  function handleAddCriterion() {
    setCriteria((prev) => [...prev, { id: nanoid(), text: "", weight: 3 }]);
  }

  function handleUpdateCriterion(id: string, field: "text" | "weight", value: string | number) {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function handleRemoveCriterion(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }

  // --- Evaluation ---
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

  // --- Auto-improve ---
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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <CommandPalette
        onRunEvaluation={handleRunEvaluation}
        onAddTestCase={handleAddTestCase}
        onAddCriterion={handleAddCriterion}
        onAutoImprove={handleAutoImprove}
        canRun={canRun}
        canImprove={canImprove}
      />

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Prompt Evaluation Studio</h1>
            <p className="text-sm text-gray-500 mt-1">Unit tests for your prompts</p>
          </div>
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-500 border border-gray-700 rounded-md">
            <span>⌘</span><span>K</span>
          </kbd>
        </div>

        {/* Step 1 + 2 side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Step 1 — Prompt &amp; Test Cases
            </h2>
            <PromptSetup
              systemPrompt={systemPrompt}
              onSystemPromptChange={setSystemPrompt}
              testCases={testCases}
              onAddTestCase={handleAddTestCase}
              onUpdateTestCase={handleUpdateTestCase}
              onRemoveTestCase={handleRemoveTestCase}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Step 2 — Evaluation Criteria
            </h2>
            <CriteriaBuilder
              criteria={criteria}
              onAddCriterion={handleAddCriterion}
              onUpdateCriterion={handleUpdateCriterion}
              onRemoveCriterion={handleRemoveCriterion}
            />
          </section>
        </div>

        {/* Step 3 — Results */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Step 3 — Results
          </h2>
          <ResultsDashboard
            status={status}
            results={results}
            onRunEvaluation={handleRunEvaluation}
            onAutoImprove={handleAutoImprove}
            improvedPrompt={improvedPrompt}
            originalPrompt={systemPrompt}
          />
        </section>
      </div>
    </div>
  );
}
