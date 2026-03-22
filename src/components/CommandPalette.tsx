import { useEffect, useState } from "react";
import { Command } from "cmdk";

interface Props {
  onRunEvaluation: () => void;
  onAddTestCase: () => void;
  onAddCriterion: () => void;
  onAutoImprove: () => void;
  canRun: boolean;
  canImprove: boolean;
}

export function CommandPalette({ onRunEvaluation, onAddTestCase, onAddCriterion, onAutoImprove, canRun, canImprove }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function run(action: () => void) {
    action();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden"
        style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "4px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.Input
            autoFocus
            placeholder="type a command..."
            className="w-full bg-transparent px-4 py-3 text-sm outline-none"
            style={{
              color: "#00ff41",
              borderBottom: "1px solid #2a2a2a",
              caretColor: "#00ff41",
            }}
          />
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm" style={{ color: "#6b6b6b" }}>
              no commands found.
            </Command.Empty>

            <Command.Group
              heading="eval"
              className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:tracking-widest"
              style={{ color: "#6b6b6b" }}
            >
              <Command.Item
                onSelect={() => canRun && run(onRunEvaluation)}
                disabled={!canRun}
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded aria-selected:bg-[#1a1a1a] aria-disabled:opacity-30 aria-disabled:cursor-not-allowed"
                style={{ color: "#00ff41" }}
              >
                ▶ run evaluation
              </Command.Item>
              <Command.Item
                onSelect={() => canImprove && run(onAutoImprove)}
                disabled={!canImprove}
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded aria-selected:bg-[#1a1a1a] aria-disabled:opacity-30 aria-disabled:cursor-not-allowed"
                style={{ color: "#00ff41" }}
              >
                ✦ auto-improve prompt
              </Command.Item>
            </Command.Group>

            <Command.Group
              heading="add"
              className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:tracking-widest mt-1"
              style={{ color: "#6b6b6b" }}
            >
              <Command.Item
                onSelect={() => run(onAddTestCase)}
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded aria-selected:bg-[#1a1a1a]"
                style={{ color: "#00ff41" }}
              >
                + add test case
              </Command.Item>
              <Command.Item
                onSelect={() => run(onAddCriterion)}
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded aria-selected:bg-[#1a1a1a]"
                style={{ color: "#00ff41" }}
              >
                + add criterion
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
