import { useState } from "react";
import type { Criterion } from "../types";

interface Props {
  criteria: Criterion[];
  onAddCriterion: () => void;
  onUpdateCriterion: (id: string, field: "text" | "weight", value: string | number) => void;
  onRemoveCriterion: (id: string) => void;
}

const WEIGHTS = [1, 2, 3, 4, 5] as const;

interface WeightStarsProps {
  value: Criterion["weight"];
  onChange: (weight: Criterion["weight"]) => void;
}

function WeightStars({ value, onChange }: WeightStarsProps) {
  const [hover, setHover] = useState<number>(0);
  const activeValue = hover || value;

  return (
    <div
      className="flex gap-1 shrink-0"
      onMouseLeave={() => setHover(0)}
      role="radiogroup"
      aria-label="Importance rating"
    >
      {WEIGHTS.map((w) => {
        const isActive = w <= activeValue;

        return (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={value === w}
            aria-label={`Set importance to ${w} out of 5`}
            onClick={() => onChange(w)}
            onMouseEnter={() => setHover(w)}
            className="w-6 h-6 p-0.5 transition-transform hover:scale-110"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-full h-full"
              fill={isActive ? "#00ff41" : "#1a1a1a"}
              stroke={isActive ? "#00ff41" : "#444"}
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M12 3.6l2.6 5.27 5.82.85-4.21 4.1 1 5.8L12 16.86 6.79 19.62l1-5.8-4.21-4.1 5.82-.85L12 3.6z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

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
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] tracking-widest" style={{ color: "#6b6b6b" }}>
              WEIGHT
            </span>
            <WeightStars
              value={c.weight}
              onChange={(weight) => onUpdateCriterion(c.id, "weight", weight)}
            />
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
