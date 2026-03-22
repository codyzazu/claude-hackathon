import { useRef, useState, type ChangeEvent } from "react";
import type { ReferenceFile } from "../types";

interface Props {
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  referenceFiles: ReferenceFile[];
  onAddReferenceFiles: (files: File[]) => void;
  onRemoveReferenceFile: (id: string) => void;
}

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function isSupportedFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  return hasAllowedExtension || ALLOWED_MIME_TYPES.has(file.type);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PromptSetup({
  systemPrompt,
  onSystemPromptChange,
  referenceFiles,
  onAddReferenceFiles,
  onRemoveReferenceFile,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handlePickFiles() {
    fileInputRef.current?.click();
  }

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    const supported = selected.filter(isSupportedFile);
    const rejectedCount = selected.length - supported.length;

    if (supported.length > 0) {
      onAddReferenceFiles(supported);
    }

    setUploadError(
      rejectedCount > 0
        ? `${rejectedCount} file(s) skipped. Only PDF, DOC, and DOCX are allowed.`
        : null
    );

    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        className="flex flex-col gap-2 p-3"
        style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "4px" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#6b6b6b" }}>
            Reference files (PDF, DOC, DOCX)
          </p>
          <button
            type="button"
            onClick={handlePickFiles}
            className="text-xs px-2.5 py-1 rounded transition-opacity hover:opacity-70"
            style={{ color: "#00ff41", border: "1px solid #2a2a2a", background: "#0f0f0f" }}
          >
            + add files
          </button>
        </div>

        {referenceFiles.length === 0 ? (
          <p className="text-xs" style={{ color: "#555" }}>
            No files attached yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {referenceFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-2 py-1"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px" }}
              >
                <span className="text-xs" style={{ color: "#00ff41" }}>
                  {file.name}
                </span>
                <span className="text-[10px]" style={{ color: "#6b6b6b" }}>
                  {formatSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveReferenceFile(file.id)}
                  className="text-xs leading-none"
                  style={{ color: "#ff4444" }}
                  aria-label={`Remove ${file.name}`}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadError && (
          <p className="text-xs" style={{ color: "#ff4444" }}>
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
}
