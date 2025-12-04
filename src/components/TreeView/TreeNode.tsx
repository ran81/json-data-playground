import React, { useEffect, useMemo, useState } from "react";
import { isPlainObject } from "../../lib/jsonUtils";

type Props = {
  name: string;
  value: unknown;
  depth: number;
  path: string;
  selectedPath: string;
  onSelectPath: (p: string) => void;
  searchTerm: string;
};

export default function TreeNode({
  name,
  value,
  depth,
  path,
  selectedPath,
  onSelectPath,
  searchTerm,
}: Props) {
  // Determine whether this node is "expandable" (object or array)
  const isExpandable = typeof value === "object" && value !== null;

  // Helper: primitive string to display
  const valueAsString = useMemo(() => {
    if (typeof value === "string") return `"${value}"`;
    if (value === null) return "null";
    if (typeof value === "undefined") return "undefined";
    if (typeof value === "object") return null;
    return String(value);
  }, [value]);

  // Search matching logic
  const term = searchTerm.trim().toLowerCase();
  const keyMatches = term.length > 0 && name.toLowerCase().includes(term);
  const valueMatches =
    term.length > 0 &&
    valueAsString !== null &&
    valueAsString.toLowerCase().includes(term);

  const thisNodeMatches = keyMatches || valueMatches;

  // Recursive helper to check whether subtree contains the search term.
  // We keep this function pure and independent of component state.
  function subtreeContainsMatch(
    v: unknown,
    nodeName: string,
    q: string
  ): boolean {
    if (!q) return false;
    const lower = q.toLowerCase();

    // Check current node name
    if (nodeName.toLowerCase().includes(lower)) return true;

    // Primitive value check
    if (v === null) {
      if ("null".includes(lower)) return true;
      return false;
    }
    if (typeof v !== "object") {
      if (String(v).toLowerCase().includes(lower)) return true;
      return false;
    }

    // Array
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        if (subtreeContainsMatch(v[i], String(i), q)) return true;
      }
      return false;
    }

    // Plain object
    if (isPlainObject(v)) {
      for (const [k, val] of Object.entries(v)) {
        if (subtreeContainsMatch(val, k, q)) return true;
      }
      return false;
    }

    return false;
  }

  const subtreeHasMatch = useMemo(
    () => subtreeContainsMatch(value, name, term),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, name, term]
  );

  // open state: auto-open if there's a search term that matches inside
  const [open, setOpen] = useState<boolean>(!!subtreeHasMatch);

  // When searchTerm changes, force-open matching branches.
  useEffect(() => {
    if (term) {
      setOpen(subtreeHasMatch);
    }
    // when search cleared, keep the user's open/close preference (don't auto-collapse)
    // If you prefer to collapse when search cleared, uncomment next line:
    // else setOpen(false);
  }, [term, subtreeHasMatch]);

  // Selected highlight
  const isSelected = selectedPath === path;

  // Styling classes
  const baseLineClasses =
    "flex items-center cursor-pointer select-none rounded px-1";
  const selectedClass = isSelected ? "bg-blue-100" : "";
  const hoverClass = !isSelected ? "hover:bg-gray-50" : "";
  const matchHighlightClass = thisNodeMatches ? "bg-yellow-200" : "";

  // click handler for selecting path
  function handleSelect(e?: React.MouseEvent) {
    e?.stopPropagation();
    onSelectPath(path);
  }

  // caret click toggles open
  function toggleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen((s) => !s);
    onSelectPath(path); // also select when toggling
  }

  // Render primitive
  if (!isExpandable) {
    return (
      <div style={{ paddingLeft: depth * 12 }} className="py-0.5">
        <div
          onClick={handleSelect}
          className={`${baseLineClasses} ${selectedClass} ${hoverClass}`}
        >
          <span className={`mr-2 text-gray-600 ${matchHighlightClass}`}>
            {name}:
          </span>
          <span className={`${primitiveColor(value)} ${matchHighlightClass}`}>
            {valueAsString}
          </span>
        </div>
      </div>
    );
  }

  // Render array
  if (Array.isArray(value)) {
    return (
      <div className="py-0.5">
        <div
          style={{ paddingLeft: depth * 12 }}
          onClick={handleSelect}
          className={`${baseLineClasses} ${selectedClass} ${hoverClass}`}
        >
          <button
            onClick={toggleOpen}
            className="mr-2 text-xs"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? "▼" : "▶"}
          </button>

          <span className={`${matchHighlightClass}`}>
            <span className="text-gray-700">{name}:</span>{" "}
            <span className="text-blue-600">Array({value.length})</span>
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
              searchTerm={searchTerm}
            />
          ))}
      </div>
    );
  }

  // Render object
  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    return (
      <div className="py-0.5">
        <div
          style={{ paddingLeft: depth * 12 }}
          onClick={handleSelect}
          className={`${baseLineClasses} ${selectedClass} ${hoverClass}`}
        >
          <button
            onClick={toggleOpen}
            className="mr-2 text-xs"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? "▼" : "▶"}
          </button>

          <span className={`${matchHighlightClass}`}>
            <span className="text-gray-700">{name}:</span>{" "}
            <span className="text-green-700">{`{…}`}</span>
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
              searchTerm={searchTerm}
            />
          ))}
      </div>
    );
  }

  // Fallback (shouldn't happen)
  return (
    <div style={{ paddingLeft: depth * 12 }} className="py-0.5">
      <div
        onClick={handleSelect}
        className={`${baseLineClasses} ${selectedClass} ${hoverClass}`}
      >
        <span className="text-gray-600">{name}:</span>
        <span className="text-gray-800">unknown</span>
      </div>
    </div>
  );
}

/* Helpers */

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
