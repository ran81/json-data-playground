import { useState, useMemo } from "react";
import { parseJson } from "../lib/parseJson";

export function useJsonState() {
  const [text, setText] = useState("");

  const parsed = useMemo(() => parseJson(text), [text]);

  return {
    text,
    setText,
    parsedJson: parsed.ok ? parsed.value : null,
    error: parsed.ok ? null : parsed.error,
  };
}
