import { useState, useMemo } from "react";
import { parseJson } from "../lib/parseJson";
import { LS_KEY_VALUE } from "../constants";

function getStats(text: string) {
  const chars = text.length;
  const lines = text.split("\n").length;
  const bytes = new Blob([text]).size;
  return { chars, lines, bytes };
}

export function useJsonState() {
  const saved = localStorage.getItem(LS_KEY_VALUE);
  const [text, setRawText] = useState(saved ?? "");
  const [stats, setStats] = useState(
    saved ? getStats(saved) : { chars: 0, lines: 1, bytes: 0 }
  );

  const setText = (newText: string) => {
    setRawText(newText);
    setStats(getStats(newText));
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
