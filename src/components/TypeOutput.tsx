import { inferType } from "../lib/inferType";
import { renderTs } from "../lib/renderTs";

type Props = {
  value: unknown;
};

export default function TypeOutput({ value }: Props) {
  if (value === null) {
    return (
      <div className="p-3 bg-white border rounded shadow-sm">
        <h2 className="font-semibold mb-2">Inferred Types</h2>
        <div className="text-gray-500 text-sm">No JSON yet.</div>
      </div>
    );
  }

  const typeAst = inferType(value);
  const output = renderTs("Root", typeAst);

  return (
    <div className="p-3 bg-white border rounded shadow-sm">
      <h2 className="font-semibold mb-2">Inferred Types</h2>
      <pre className="text-sm text-gray-700 whitespace-pre-wrap">{output}</pre>
    </div>
  );
}
