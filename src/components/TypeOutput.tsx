import { useMemo } from "react";
import { inferType, createRegistry } from "../lib/inferType";
import { renderAllTypes } from "../lib/renderTs";
import CopyButton from "./CopyButton";

type Props = {
  value: unknown;
};

export default function TypeOutput({ value }: Props) {
  const output = useMemo(() => {
    if (value === null) return null;

    // 1) create a fresh registry for this inference run
    const registry = createRegistry();

    // 2) infer the root type (this will populate registry.definitions)
    const rootType = inferType(value, registry, "Root");

    // 3) render all types (Root + any named nested types)
    return renderAllTypes("Root", rootType, registry);
  }, [value]);

  if (value === null) {
    return (
      <div className="p-3 bg-white border rounded shadow-sm">
        <h2 className="font-semibold mb-2">Inferred Types</h2>
        <div className="text-gray-500 text-sm">No JSON yet.</div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white border rounded shadow-sm">
      <div className="flex justify-between">
        <h2 className="font-semibold mb-2">Inferred Types</h2>
        <CopyButton text={output!} tooltip="Copy types" />
      </div>
      <pre className="text-sm text-gray-700 whitespace-pre-wrap">{output}</pre>
    </div>
  );
}
