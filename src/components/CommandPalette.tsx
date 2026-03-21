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

export function CommandPalette({
  onRunEvaluation,
  onAddTestCase,
  onAddCriterion,
  onAutoImprove,
  canRun,
  canImprove,
}: Props) {
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.Input
            autoFocus
            placeholder="Type a command..."
            className="w-full bg-transparent px-4 py-3 text-gray-100 text-sm outline-none border-b border-gray-700 placeholder:text-gray-500"
          />
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              No commands found.
            </Command.Empty>

            <Command.Group heading="Evaluation" className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide">
              <Command.Item
                onSelect={() => canRun && run(onRunEvaluation)}
                disabled={!canRun}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 cursor-pointer aria-selected:bg-gray-800 aria-disabled:opacity-40 aria-disabled:cursor-not-allowed"
              >
                <span className="text-violet-400">▶</span>
                Run Evaluation
              </Command.Item>
              <Command.Item
                onSelect={() => canImprove && run(onAutoImprove)}
                disabled={!canImprove}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 cursor-pointer aria-selected:bg-gray-800 aria-disabled:opacity-40 aria-disabled:cursor-not-allowed"
              >
                <span className="text-green-400">✦</span>
                Auto-Improve Prompt
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Add" className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide mt-1">
              <Command.Item
                onSelect={() => run(onAddTestCase)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 cursor-pointer aria-selected:bg-gray-800"
              >
                <span className="text-blue-400">+</span>
                Add Test Case
              </Command.Item>
              <Command.Item
                onSelect={() => run(onAddCriterion)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 cursor-pointer aria-selected:bg-gray-800"
              >
                <span className="text-blue-400">+</span>
                Add Criterion
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
