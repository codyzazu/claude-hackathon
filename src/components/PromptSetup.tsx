import type { TestCase } from "../types";

interface Props {
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  testCases: TestCase[];
  onAddTestCase: () => void;
  onUpdateTestCase: (id: string, input: string) => void;
  onRemoveTestCase: (id: string) => void;
}

export function PromptSetup({
  systemPrompt,
  onSystemPromptChange,
  testCases,
  onAddTestCase,
  onUpdateTestCase,
  onRemoveTestCase,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">System Prompt</label>
        <textarea
          className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100 text-sm font-mono resize-y focus:outline-none focus:border-violet-500"
          placeholder="You are a helpful customer support agent..."
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Test Cases <span className="text-gray-500">({testCases.length})</span>
          </label>
          <button
            onClick={onAddTestCase}
            className="text-sm px-3 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            + Add Test Case
          </button>
        </div>

        {testCases.length === 0 && (
          <p className="text-sm text-gray-500 italic">No test cases yet. Add one to get started.</p>
        )}

        {testCases.map((tc, index) => (
          <div key={tc.id} className="flex gap-2 items-start">
            <span className="text-xs text-gray-500 mt-2.5 w-5 shrink-0">{index + 1}.</span>
            <input
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
              placeholder="e.g. How do I reset my password?"
              value={tc.input}
              onChange={(e) => onUpdateTestCase(tc.id, e.target.value)}
            />
            <button
              onClick={() => onRemoveTestCase(tc.id)}
              className="text-gray-500 hover:text-red-400 mt-2 transition-colors text-lg leading-none"
              aria-label="Remove test case"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
