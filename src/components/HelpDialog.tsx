interface Props {
  open: boolean;
  onClose: () => void;
}

export function HelpDialog({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.78)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl p-5 sm:p-6"
        style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "4px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm tracking-[0.18em]" style={{ color: "#00ff41" }}>
            HOW TO USE THIS TOOL
          </h2>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded hover:opacity-70"
            style={{ color: "#6b6b6b", border: "1px solid #2a2a2a" }}
          >
            close
          </button>
        </div>

        <div className="space-y-4 text-xs leading-6" style={{ color: "#6b6b6b" }}>
          <p>
            1. Write your <span style={{ color: "#00ff41" }}>system prompt</span> in the top-left editor.
          </p>
          <p>
            2. Add <span style={{ color: "#00ff41" }}>test cases</span> that represent real user inputs.
          </p>
          <p>
            3. Define <span style={{ color: "#00ff41" }}>criteria</span> and set star <span style={{ color: "#00ff41" }}>weights</span>. Higher stars mean
            that criterion has more importance.
          </p>
          <p>
            4. Choose one or more <span style={{ color: "#00ff41" }}>models</span>, then run evaluation.
          </p>
          <p>
            5. Review overall scores and the per-criterion pass/fail breakdown. Use export buttons in results to share JSON or CSV.
          </p>
        </div>
      </div>
    </div>
  );
}
