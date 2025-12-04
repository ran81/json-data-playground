import { useState } from "react";
import { isPlainObject } from "../../lib/jsonUtils";

type Props = {
  name: string;
  value: unknown;
  depth: number;
  path: string;
  selectedPath: string;
  onSelectPath: (p: string) => void;
};

export function TreeNode({
  name,
  value,
  depth,
  path,
  selectedPath,
  onSelectPath,
}: Props) {
  const [open, setOpen] = useState(true);

  const isSelected = selectedPath === path;
  const nodeBg = isSelected ? "bg-blue-100" : "";
  const hoverBg = isSelected ? "" : "hover:bg-gray-50";

  // Node label line
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectPath(path);
  };

  const lineClasses = `flex items-center cursor-pointer select-none rounded px-1 ${nodeBg} ${hoverBg}`;

  // Primitive
  if (typeof value !== "object" || value === null) {
    return (
      <div style={{ paddingLeft: depth * 12 }} className="py-0.5">
        <div onClick={handleSelect} className={lineClasses}>
          <span className="text-gray-600">{name}: </span>
          <span className={primitiveColor(value)}>
            {formatPrimitive(value)}
          </span>
        </div>
      </div>
    );
  }

  // Array
  if (Array.isArray(value)) {
    return (
      <div className="py-0.5">
        <div
          style={{ paddingLeft: depth * 12 }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
            onSelectPath(path);
          }}
          className={lineClasses}
        >
          <span className="mr-1">{open ? "▼" : "▶"}</span>
          <span className="text-gray-700">
            {name}: <span className="text-blue-600">Array({value.length})</span>
          </span>
        </div>

        {open &&
          value.map((v, i) => (
            <TreeNode
              key={i}
              name={String(i)}
              value={v}
              depth={depth + 1}
              path={`${path}[${i}]`}
              selectedPath={selectedPath}
              onSelectPath={onSelectPath}
            />
          ))}
      </div>
    );
  }

  // Object
  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    return (
      <div className="py-0.5">
        <div
          style={{ paddingLeft: depth * 12 }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
            onSelectPath(path);
          }}
          className={lineClasses}
        >
          <span className="mr-1">{open ? "▼" : "▶"}</span>
          <span className="text-gray-700">
            {name}: <span className="text-green-700">{`{…}`}</span>
          </span>
        </div>

        {open &&
          entries.map(([k, v]) => (
            <TreeNode
              key={k}
              name={k}
              value={v}
              depth={depth + 1}
              path={`${path}.${k}`}
              selectedPath={selectedPath}
              onSelectPath={onSelectPath}
            />
          ))}
      </div>
    );
  }

  // fallback
  return (
    <div style={{ paddingLeft: depth * 12 }} className="py-0.5">
      <div onClick={handleSelect} className={lineClasses}>
        <span className="text-gray-600">{name}: </span>
        <span className="text-gray-800">unknown</span>
      </div>
    </div>
  );
}

//
// Helpers
//

function formatPrimitive(v: unknown) {
  if (typeof v === "string") return `"${v}"`;
  if (v === null) return "null";
  return String(v);
}

function primitiveColor(v: unknown) {
  switch (typeof v) {
    case "string":
      return "text-red-700";
    case "number":
      return "text-blue-700";
    case "boolean":
      return "text-purple-700";
    default:
      return "text-gray-800";
  }
}
