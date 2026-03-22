import type { TestCase } from "../types";

interface Props {
  testCases: TestCase[];
  onAddTestCase: () => void;
  onAddStarterExamples: () => void;
  onUpdateTestCase: (id: string, input: string) => void;
  onRemoveTestCase: (id: string) => void;
}

export function TestCaseList({
  testCases,
  onAddTestCase,
  onAddStarterExamples,
  onUpdateTestCase,
  onRemoveTestCase,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs" style={{ color: "#6b6b6b" }}>
        Add realistic user messages. Example format: "User asks: How do I reset my password?"
      </p>

      {testCases.map((tc) => (
        <div key={tc.id} className="flex items-center gap-2 group">
          <span className="text-sm shrink-0" style={{ color: "#00ff41" }}>→</span>
          <input
            className="flex-1 bg-transparent text-sm outline-none py-2 px-3 transition-colors"
            style={{
              background: "#1a1a1a",
              color: "#00ff41",
              border: "1px solid #2a2a2a",
              borderRadius: "4px",
              caretColor: "#00ff41",
            }}
            placeholder="e.g. User asks: How do I reset my password?"
            value={tc.input}
            onChange={(e) => onUpdateTestCase(tc.id, e.target.value)}
            spellCheck={false}
          />
          <button
            onClick={() => onRemoveTestCase(tc.id)}
            className="opacity-0 group-hover:opacity-100 text-lg leading-none transition-opacity"
            style={{ color: "#ff4444" }}
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}

      <button
        onClick={onAddTestCase}
        className="text-sm py-2 px-3 text-left transition-opacity hover:opacity-70"
        style={{
          background: "#1a1a1a",
          color: "#6b6b6b",
          border: "1px solid #2a2a2a",
          borderRadius: "4px",
        }}
      >
        + add test case
      </button>

      {testCases.length === 0 && (
        <button
          onClick={onAddStarterExamples}
          className="text-sm py-2 px-3 text-left transition-opacity hover:opacity-70"
          style={{
            background: "#101b12",
            color: "#00ff41",
            border: "1px solid #244d2e",
            borderRadius: "4px",
          }}
        >
          + insert starter examples
        </button>
      )}
    </div>
  );
}
