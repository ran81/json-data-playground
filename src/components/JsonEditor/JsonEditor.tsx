type Props = {
  value: string;
  onChange: (v: string) => void;
};

function JsonEditor({ value, onChange }: Props) {
  function handleSample() {
    const sample = {
      users: [
        { id: 1, name: "Alice", age: 30 },
        { id: 2, name: "Bob", age: 25 },
      ],
    };
    onChange(JSON.stringify(sample, null, 2));
  }

  function handleFormat() {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore for now — error panel will handle it later
    }
  }

  function handleClear() {
    onChange("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Buttons */}
      <div className="flex gap-2 mb-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={handleFormat}
        >
          Format
        </button>
        <button className="px-3 py-1 bg-gray-200 rounded" onClick={handleClear}>
          Clear
        </button>
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={handleSample}
        >
          Sample JSON
        </button>
      </div>

      {/* Textarea */}
      <textarea
        className="flex-1 font-mono text-sm p-2 border rounded resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default JsonEditor;
