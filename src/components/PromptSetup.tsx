interface Props {
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
}

export function PromptSetup({ systemPrompt, onSystemPromptChange }: Props) {
  return (
    <textarea
      className="w-full h-52 resize-none p-4 text-sm outline-none transition-colors"
      style={{
        background: "#1a1a1a",
        color: "#00ff41",
        border: "1px solid #2a2a2a",
        borderRadius: "4px",
        caretColor: "#00ff41",
      }}
      placeholder="You are a customer support assistant for Acme SaaS..."
      value={systemPrompt}
      onChange={(e) => onSystemPromptChange(e.target.value)}
      spellCheck={false}
    />
  );
}
