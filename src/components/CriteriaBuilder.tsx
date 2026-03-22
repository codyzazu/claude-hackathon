import type { Criterion } from "../types";

interface Props {
  criteria: Criterion[];
  onAddCriterion: () => void;
  onUpdateCriterion: (id: string, field: "text" | "weight", value: string | number) => void;
  onRemoveCriterion: (id: string) => void;
}

const WEIGHTS = [1, 2, 3, 4, 5] as const;

export function CriteriaBuilder({ criteria, onAddCriterion, onUpdateCriterion, onRemoveCriterion }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {criteria.map((c) => (
        <div key={c.id} className="flex items-center gap-2 group">
          <input
            className="flex-1 text-sm py-2 px-3 outline-none transition-colors"
            style={{
              background: "#1a1a1a",
              color: "#00ff41",
              border: "1px solid #2a2a2a",
              borderRadius: "4px",
              caretColor: "#00ff41",
            }}
            placeholder="e.g. response_length < 80 words"
            value={c.text}
            onChange={(e) => onUpdateCriterion(c.id, "text", e.target.value)}
            spellCheck={false}
          />
          <div className="flex gap-1 shrink-0">
            {WEIGHTS.map((w) => (
              <button
                key={w}
                onClick={() => onUpdateCriterion(c.id, "weight", w)}
                className="w-6 h-6 rounded text-xs font-bold transition-colors"
                style={{
                  background: c.weight === w ? "#00ff41" : "#1a1a1a",
                  color: c.weight === w ? "#0f0f0f" : "#6b6b6b",
                  border: "1px solid #2a2a2a",
                }}
              >
                {w}
              </button>
            ))}
          </div>
          <button
            onClick={() => onRemoveCriterion(c.id)}
            className="opacity-0 group-hover:opacity-100 text-lg leading-none transition-opacity"
            style={{ color: "#ff4444" }}
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}

      <button
        onClick={onAddCriterion}
        className="text-sm py-2 px-3 text-left transition-opacity hover:opacity-70"
        style={{
          background: "#1a1a1a",
          color: "#6b6b6b",
          border: "1px solid #2a2a2a",
          borderRadius: "4px",
        }}
      >
        + add criterion
      </button>
    </div>
  );
}
