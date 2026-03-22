import type { PromptVersion } from "../hooks/usePromptHistory";

interface Props {
  versions: PromptVersion[];
  currentPrompt: string;
  onRestore: (prompt: string) => void;
  onClear: () => void;
  open: boolean;
  onClose: () => void;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#00ff41";
  if (score >= 60) return "#fbbf24";
  return "#ff4444";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function PromptHistory({ versions, currentPrompt, onRestore, onClear, open, onClose }: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "300px",
          background: "#0d0d0d",
          borderLeft: "1px solid #2a2a2a",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: "1px solid #2a2a2a" }}
        >
          <span className="text-xs tracking-[0.2em]" style={{ color: "#6b6b6b" }}>
            PROMPT HISTORY
          </span>
          <div className="flex items-center gap-3">
            {versions.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "#6b6b6b" }}
              >
                clear
              </button>
            )}
            <button
              onClick={onClose}
              className="text-lg leading-none transition-opacity hover:opacity-70"
              style={{ color: "#6b6b6b" }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Version list */}
        <div className="flex-1 overflow-y-auto">
          {versions.length === 0 ? (
            <p className="px-4 py-6 text-xs" style={{ color: "#444" }}>
              — no history yet. run an evaluation to start tracking versions.
            </p>
          ) : (
            <div className="flex flex-col">
              {versions.map((v, i) => {
                const versionNumber = versions.length - i;
                const isCurrent = v.prompt === currentPrompt;
                const isOriginal = i === versions.length - 1;

                return (
                  <button
                    key={v.id}
                    onClick={() => onRestore(v.prompt)}
                    className="flex flex-col gap-1.5 px-4 py-3 text-left transition-colors hover:bg-[#1a1a1a] w-full"
                    style={{ borderBottom: "1px solid #1e1e1e" }}
                  >
                    {/* Top row: version + score + tags */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: scoreColor(v.score) }}>
                        v{versionNumber} — {v.score}/100
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,255,65,0.1)", color: "#00ff41", border: "1px solid rgba(0,255,65,0.3)" }}>
                          current
                        </span>
                      )}
                      {isOriginal && !isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,68,68,0.1)", color: "#ff4444", border: "1px solid rgba(255,68,68,0.3)" }}>
                          original
                        </span>
                      )}
                    </div>

                    {/* Prompt preview */}
                    <p className="text-xs leading-relaxed" style={{ color: "#6b6b6b" }}>
                      {v.prompt.slice(0, 60)}{v.prompt.length > 60 ? "…" : ""}
                    </p>

                    {/* Timestamp */}
                    <p className="text-[10px]" style={{ color: "#444" }}>
                      {formatTime(v.timestamp)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
