import { useState, useMemo } from "react";
import { parseJson } from "../lib/parseJson";

export function useJsonState() {
  const saved = localStorage.getItem("json-playground-value");
  const [text, setRawText] = useState(saved ?? "");
  const [stats, setStats] = useState({ chars: 0, lines: 1, bytes: 0 });

  const setText = (newText: string) => {
    setRawText(newText);

    const chars = newText.length;
    const lines = newText.split("\n").length;
    const bytes = new Blob([newText]).size;

    setStats({ chars, lines, bytes });
  };

  const parsed = useMemo(() => parseJson(text), [text]);

  return {
    text,
    setText,
    parsedJson: parsed.ok ? parsed.value : null,
    error: parsed.ok ? null : parsed.error,
    stats,
  };
}
