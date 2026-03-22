import { useState, useCallback } from "react";
import { nanoid } from "nanoid";

export interface PromptVersion {
  id: string;
  timestamp: Date;
  prompt: string;
  score: number;
}

const STORAGE_KEY = "prompt-eval-history";
const MAX_VERSIONS = 20;

function load(): PromptVersion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Omit<PromptVersion, "timestamp"> & { timestamp: string }>;
    return parsed.map((v) => ({ ...v, timestamp: new Date(v.timestamp) }));
  } catch {
    return [];
  }
}

function save(versions: PromptVersion[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
}

export function usePromptHistory() {
  const [versions, setVersions] = useState<PromptVersion[]>(load);

  const addVersion = useCallback((prompt: string, score: number) => {
    setVersions((prev) => {
      // Skip if identical prompt already saved as latest version
      if (prev.length > 0 && prev[0].prompt === prompt) return prev;

      const next: PromptVersion[] = [
        { id: nanoid(), timestamp: new Date(), prompt, score },
        ...prev,
      ].slice(0, MAX_VERSIONS);

      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setVersions([]);
  }, []);

  return { versions, addVersion, clear };
}
