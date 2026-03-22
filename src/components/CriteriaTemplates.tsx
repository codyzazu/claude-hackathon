import { useState, useEffect, useRef } from "react";
import type { Criterion } from "../types";

interface Template {
  id: string;
  label: string;
  icon: string;
  criteria: Array<{ text: string; weight: 1 | 2 | 3 | 4 | 5 }>;
}

const TEMPLATES: Template[] = [
  {
    id: "customer-support",
    label: "Customer Support Bot",
    icon: "🎧",
    criteria: [
      { text: "Response must be under 80 words", weight: 3 },
      { text: "Tone must be empathetic and professional", weight: 5 },
      { text: "Must never mention or compare competitor products", weight: 5 },
      { text: "Must only answer questions relevant to the product", weight: 4 },
      { text: "Must always provide a clear next step or resolution", weight: 4 },
    ],
  },
  {
    id: "code-review",
    label: "Code Review Assistant",
    icon: "🔍",
    criteria: [
      { text: "Must reference specific line numbers or code sections", weight: 4 },
      { text: "Feedback must be constructive, not harsh or dismissive", weight: 5 },
      { text: "Must suggest a fix, not just identify the problem", weight: 5 },
      { text: "Must flag any security or performance implications", weight: 4 },
      { text: "Response must be concise and scannable", weight: 3 },
    ],
  },
  {
    id: "educational-tutor",
    label: "Educational Tutor",
    icon: "📚",
    criteria: [
      { text: "Must guide student to answer without giving it directly", weight: 5 },
      { text: "Must use at least one analogy or real-world example", weight: 4 },
      { text: "Must check for understanding at the end of response", weight: 4 },
      { text: "Language must be age-appropriate and jargon-free", weight: 3 },
      { text: "Must encourage curiosity and further exploration", weight: 3 },
    ],
  },
  {
    id: "content-moderation",
    label: "Content Moderation Assistant",
    icon: "🛡️",
    criteria: [
      { text: "Must correctly identify harmful or policy-violating content", weight: 5 },
      { text: "Must minimize false positives on benign content", weight: 5 },
      { text: "Must explain the specific reason for any flag or removal", weight: 4 },
      { text: "Must apply consistent standards across similar cases", weight: 4 },
      { text: "Tone must be neutral and non-judgmental", weight: 3 },
    ],
  },
  {
    id: "medical-info",
    label: "Medical Information Bot",
    icon: "🏥",
    criteria: [
      { text: "Must always recommend consulting a medical professional", weight: 5 },
      { text: "Must never use diagnostic language (e.g. 'you have')", weight: 5 },
      { text: "Must clearly state limitations of AI medical information", weight: 4 },
      { text: "Medical terminology must be accurate and correctly used", weight: 4 },
      { text: "Tone must be calm, clear and never alarmist", weight: 3 },
    ],
  },
];

interface Props {
  onLoad: (criteria: Criterion[]) => void;
  onReset: () => void;
  hasCriteria: boolean;
}

export function CriteriaTemplates({ onLoad, onReset, hasCriteria }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSelect(template: Template) {
    const criteria: Criterion[] = template.criteria.map((c) => ({
      id: crypto.randomUUID(),
      text: c.text,
      weight: c.weight,
    }));
    onLoad(criteria);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-2" ref={ref}>
      {hasCriteria && (
        <button
          onClick={onReset}
          className="text-xs px-2.5 py-1 rounded transition-opacity hover:opacity-70 outline-none"
          style={{ color: "#ff4444" }}
        >
          reset
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs px-2.5 py-1 rounded transition-colors outline-none"
          style={{
            border: "1px solid #2a2a2a",
            color: open ? "#00ff41" : "#6b6b6b",
            background: open ? "rgba(0,255,65,0.06)" : "transparent",
          }}
        >
          load template ▾
        </button>

        {open && (
          <div
            className="absolute top-full mt-1 right-0 z-30 flex flex-col overflow-hidden"
            style={{
              background: "#0d0d0d",
              border: "1px solid #2a2a2a",
              borderRadius: "4px",
              minWidth: "240px",
            }}
          >
            {TEMPLATES.map((t, i) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className="flex items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors hover:bg-[#1a1a1a] w-full outline-none"
                style={{
                  color: "#6b6b6b",
                  borderBottom: i < TEMPLATES.length - 1 ? "1px solid #1e1e1e" : "none",
                }}
              >
                <span>{t.icon}</span>
                <span style={{ color: "#00ff41" }}>{t.label}</span>
                <span className="ml-auto" style={{ color: "#444" }}>{t.criteria.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
