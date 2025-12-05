import { useRef, useState } from "react";
import { editor } from "monaco-editor";
import Editor, { type OnChange } from "@monaco-editor/react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  stats: Record<string, number>;
};

const sampleJson = `{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "active": true
}`;

export default function JsonEditor({ value, onChange, onClear, stats }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [cursorPos, setCursorPos] = useState<{ line: number; column: number }>({
    line: 1,
    column: 1,
  });

  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editorInstance;
    editorInstance.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, column: e.position.column });
    });
  };

  const handleFormat = () => {
    if (!editorRef.current) return;
    if (!value.trim()) {
      return;
    }
    try {
      const formatted = JSON.stringify(JSON.parse(value), null, 2);
      onChange(formatted);
      editorRef.current.setValue(formatted);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Invalid JSON: cannot format");
      }
    }
  };

  const handleClear = () => {
    onChange("");
    editorRef.current?.setValue("");
    onClear?.();
  };

  const handleSample = () => {
    onChange(sampleJson);
    editorRef.current?.setValue(sampleJson);
  };

  const handleChange: OnChange = (val) => {
    if (val !== undefined) onChange(val);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleFormat}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Format
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Clear
        </button>
        <button
          onClick={handleSample}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Sample JSON
        </button>

        <div className="flex gap-2 ml-auto">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => localStorage.setItem("json-playground-value", value)}
          >
            Save
          </button>

          <button
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => {
              const stored = localStorage.getItem("json-playground-value");
              if (stored != null) onChange(stored);
            }}
          >
            Load
          </button>
        </div>
      </div>

      <div className="flex-1 border rounded overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: "on",
          }}
        />
      </div>

      <div className="h-6 text-xs text-gray-500 flex justify-between items-center px-2 border-t border-gray-200">
        {/* Left side: JSON metadata */}
        <div className="flex gap-3">
          <span>Lines: {stats.lines}</span>
          <span>Chars: {stats.chars}</span>
          <span>Size: {formatBytes(stats.bytes)}</span>
        </div>

        {/* Right side: Cursor position */}
        <div>
          Ln {cursorPos.line}, Col {cursorPos.column}
        </div>
      </div>
    </div>
  );
}

function formatBytes(num: number) {
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}
