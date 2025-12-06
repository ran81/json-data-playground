import { useCallback, useRef, useState } from "react";
import { editor } from "monaco-editor";
import Editor, { type OnChange } from "@monaco-editor/react";
import ImportModal from "./ImportModal";

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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [cursorPos, setCursorPos] = useState<{ line: number; column: number }>({
    line: 1,
    column: 1,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
    setDragError(null);
  }, []);

  const showThenHideError = (error: string) => {
    setDragError(error);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setDragError(null);
      errorTimeoutRef.current = null;
    }, 3000);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setDragError(null);

      const file = e.dataTransfer.files[0];
      if (!file) {
        return;
      }

      if (!file.type.includes("json")) {
        showThenHideError("Please drop a valid JSON file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          onChange(text);
        } else {
          showThenHideError("Unable to read file content.");
        }
      };
      reader.readAsText(file);
    },
    [onChange]
  );

  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editorInstance;
    editorInstance.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, column: e.position.column });
    });
  };

  const handleFormat = () => {
    if (!editorRef.current) {
      return;
    }
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
    onClear?.();
    onChange(sampleJson);
    editorRef.current?.setValue(sampleJson);
  };

  const handleChange: OnChange = (val) => {
    if (val !== undefined) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-1">
        <button
          onClick={handleFormat}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150 shadow-sm"
        >
          Format
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150 shadow-sm"
        >
          Clear
        </button>
        <button
          onClick={handleSample}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150 shadow-sm"
        >
          Sample JSON
        </button>

        <div className="flex gap-2 ml-auto flex-wrap">
          <button
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-150 shadow-sm"
            onClick={() => localStorage.setItem("json-playground-value", value)}
          >
            Save
          </button>

          <button
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150 shadow-sm"
            onClick={() => {
              const stored = localStorage.getItem("json-playground-value");
              if (stored != null) onChange(stored);
            }}
          >
            Load
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150 shadow-sm"
          >
            Import JSON
          </button>
        </div>
      </div>

      {/* Editor area with drag-and-drop */}
      <div
        className={`flex-1 border rounded-lg overflow-hidden relative transition-colors duration-150 ${
          isDragging ? "border-blue-500 bg-blue-50" : "bg-white"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            automaticLayout: true,
            wordWrap: "on",
          }}
        />

        {/* Overlay when dragging */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-blue-700 font-semibold bg-blue-100 bg-opacity-30 rounded-lg">
            Drop JSON file here
          </div>
        )}

        {/* Drag error message */}
        {dragError && (
          <div className="absolute bottom-2 left-2 text-red-600 text-sm bg-red-100 px-2 py-1 rounded shadow-sm">
            {dragError}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="h-6 text-xs text-gray-500 flex justify-between items-center px-2 border-t border-gray-200">
        <div className="flex gap-3">
          <span>Lines: {stats.lines}</span>
          <span>Chars: {stats.chars}</span>
          <span>Size: {formatBytes(stats.bytes)}</span>
        </div>

        <div>
          Ln {cursorPos.line}, Col {cursorPos.column}
        </div>
      </div>

      {/* Import modal */}
      <ImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(jsonText) => onChange(jsonText)}
      />
    </div>
  );
}

function formatBytes(num: number) {
  if (num < 1024) {
    return `${num} B`;
  }
  if (num < 1024 * 1024) {
    return `${(num / 1024).toFixed(1)} KB`;
  }
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}
