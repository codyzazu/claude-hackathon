import type { Criterion } from "../types";

interface Props {
  criteria: Criterion[];
  onAddCriterion: () => void;
  onUpdateCriterion: (id: string, field: "text" | "weight", value: string | number) => void;
  onRemoveCriterion: (id: string) => void;
}

const WEIGHTS = [1, 2, 3, 4, 5] as const;

export function CriteriaBuilder({
  criteria,
  onAddCriterion,
  onUpdateCriterion,
  onRemoveCriterion,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          Evaluation Criteria <span className="text-gray-500">({criteria.length})</span>
        </label>
        <button
          onClick={onAddCriterion}
          className="text-sm px-3 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          + Add Criterion
        </button>
      </div>

      {criteria.length === 0 && (
        <p className="text-sm text-gray-500 italic">No criteria yet. Add one to define what "good" looks like.</p>
      )}

      {criteria.map((c, index) => (
        <div key={c.id} className="flex gap-2 items-center">
          <span className="text-xs text-gray-500 w-5 shrink-0">{index + 1}.</span>
          <input
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
            placeholder="e.g. Response is polite and professional"
            value={c.text}
            onChange={(e) => onUpdateCriterion(c.id, "text", e.target.value)}
          />
          <div className="flex gap-1">
            {WEIGHTS.map((w) => (
              <button
                key={w}
                onClick={() => onUpdateCriterion(c.id, "weight", w)}
                className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                  c.weight === w
                    ? "bg-violet-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
                title={`Weight ${w}`}
              >
                {w}
              </button>
            ))}
          </div>
          <button
            onClick={() => onRemoveCriterion(c.id)}
            className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none"
            aria-label="Remove criterion"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
