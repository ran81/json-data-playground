import { useRef } from "react";
import { editor } from "monaco-editor";
import Editor, { type OnChange } from "@monaco-editor/react";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

const sampleJson = `{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "active": true
}`;

export default function JsonEditor({ value, onChange }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editorInstance;
  };

  const handleFormat = () => {
    if (!editorRef.current) return;
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
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  );
}
