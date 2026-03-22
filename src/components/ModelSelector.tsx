import type { Model } from "../types";

export const MODELS: Model[] = [
  { id: "claude-haiku-4-5-20251001", label: "Haiku", costTier: "$", description: "Fast · Cheapest" },
  { id: "claude-sonnet-4-20250514", label: "Sonnet", costTier: "$$", description: "Balanced · Recommended", recommended: true },
  { id: "claude-opus-4-20250514", label: "Opus", costTier: "$$$", description: "Most capable" },
];

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function ModelSelector({ selectedIds, onChange }: Props) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return; // keep at least one selected
      onChange(selectedIds.filter((m) => m !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs tracking-[0.15em]" style={{ color: "#6b6b6b" }}>MODELS</span>
      <div className="flex gap-2">
        {MODELS.map((m) => {
          const selected = selectedIds.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs transition-all rounded"
              style={{
                background: selected ? "rgba(0,255,65,0.08)" : "#111",
                border: `1px solid ${selected ? "#00ff41" : "#2a2a2a"}`,
                color: selected ? "#00ff41" : "#6b6b6b",
              }}
            >
              <span
                className="w-3 h-3 rounded-sm flex items-center justify-center text-[10px]"
                style={{
                  border: `1px solid ${selected ? "#00ff41" : "#444"}`,
                  background: selected ? "#00ff41" : "transparent",
                  color: "#0a0a0a",
                }}
              >
                {selected ? "✓" : ""}
              </span>
              <span className="font-bold">{m.label}</span>
              <span style={{ color: "#6b6b6b" }}>{m.costTier}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
