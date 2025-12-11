import { useEffect, useRef } from "react";
import { isPlainObject } from "../lib/jsonUtils";

type Props = {
  name: string;
  value: unknown;
  depth: number;
  path: string;
  selectedPath: string;
  onSelectPath: (p: string) => void;
  searchTerm: string;
  expandedPaths: Set<string>;
  togglePath: (p: string) => void;

  // NEW (optional): worker-provided match info
  activeMatchPath?: string | null;
  allMatches?: string[]; // array of data-nodepath strings
};

export default function TreeNode({
  name,
  value,
  depth,
  path,
  selectedPath,
  onSelectPath,
  searchTerm,
  expandedPaths,
  togglePath,
  activeMatchPath,
  allMatches,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);

  // Scroll into view when selected
  useEffect(() => {
    if (selectedPath === path && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedPath, path]);

  const isExpandable = typeof value === "object" && value !== null;
  const valueAsString = getPrimitiveString(value);

  const term = searchTerm.trim().toLowerCase();

  // Old (fallback) matching based on searchTerm
  const keyMatches = term.length > 0 && name.toLowerCase().includes(term);
  const valueMatches =
    term.length > 0 &&
    valueAsString !== null &&
    valueAsString.toLowerCase().includes(term);

  // Worker-based matching (preferred when provided)
  const usingWorkerMatches = Array.isArray(allMatches);
  const matchesSet = usingWorkerMatches ? new Set(allMatches) : null;
  const pathMatchedByWorker = usingWorkerMatches
    ? matchesSet!.has(path)
    : false;
  const isActiveMatch = usingWorkerMatches ? activeMatchPath === path : false;

  // Decide whether this node should be highlighted as a match
  const thisNodeMatches = usingWorkerMatches
    ? pathMatchedByWorker
    : keyMatches || valueMatches;

  const isSelected = selectedPath === path;
  const isExpanded = expandedPaths.has(path);

  const baseLineClasses =
    "flex items-center cursor-pointer select-none rounded px-2 py-0.5 transition-all duration-150";
  const selectedClass = isSelected
    ? "bg-blue-100 dark:bg-blue-700 shadow-sm"
    : "";
  const hoverClass = !isSelected
    ? "hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-sm"
    : "";

  // Match highlight (worker match) vs active match (stronger)
  const matchHighlightClass = thisNodeMatches
    ? "bg-yellow-200 dark:bg-yellow-500 rounded px-1 dark:!text-black"
    : "";
  const activeMatchClass = isActiveMatch
    ? "bg-yellow-300 dark:bg-yellow-400 ring-1 ring-yellow-400 rounded px-1 dark:!text-black"
    : "";

  function handleSelect(e?: React.MouseEvent) {
    e?.stopPropagation();
    onSelectPath(path);
  }

  function toggleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    togglePath(path);
    onSelectPath(path);
  }

  // Helper to combine classes for the key and value spans
  const keyClassForNode = (extra = "") =>
    `${extra} mr-2 text-gray-700 dark:text-gray-300 ${
      thisNodeMatches
        ? isActiveMatch
          ? activeMatchClass
          : matchHighlightClass
        : ""
    }`;

  // Render primitive
  if (!isExpandable) {
    return (
      <div
        style={{ paddingLeft: depth * 12 }}
        ref={nodeRef}
        data-nodepath={path}
      >
        <div
          className={`${baseLineClasses} ${selectedClass} ${hoverClass}`}
          onClick={handleSelect}
        >
          <span className={keyClassForNode("")}>{name}:</span>
          <span
            className={`${primitiveColor(value)} ${
              // if using worker matches, highlight by class; otherwise preserve old behavior where valueMatches adds text color
              usingWorkerMatches
                ? thisNodeMatches
                  ? isActiveMatch
                    ? activeMatchClass + " text-gray-900 dark:text-gray-100"
                    : matchHighlightClass + " text-gray-900 dark:text-gray-100"
                  : ""
                : valueMatches
                ? matchHighlightClass + " text-gray-900 dark:text-gray-100"
                : ""
            }`}
          >
            {valueAsString}
          </span>
        </div>
      </div>
    );
  }

  // Render array
  if (Array.isArray(value)) {
    return (
      <div>
        <div
          ref={nodeRef}
          data-nodepath={path}
          style={{ paddingLeft: depth * 12 }}
          className={`${baseLineClasses} ${selectedClass} ${hoverClass}`}
          onClick={handleSelect}
        >
          <button
            onClick={toggleOpen}
            className="mr-2 text-xs text-gray-600 dark:text-gray-300"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
          <span
            className={`${
              thisNodeMatches
                ? isActiveMatch
                  ? activeMatchClass
                  : matchHighlightClass
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {name}:{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Array({value.length})
            </span>
          </span>
        </div>
        {isExpanded &&
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
              expandedPaths={expandedPaths}
              togglePath={togglePath}
              activeMatchPath={activeMatchPath}
              allMatches={allMatches}
            />
          ))}
      </div>
    );
  }

  // Render object
  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    return (
      <div>
        <div
          ref={nodeRef}
          data-nodepath={path}
          style={{ paddingLeft: depth * 12 }}
          className={`${baseLineClasses} ${selectedClass} ${hoverClass}`}
          onClick={handleSelect}
        >
          <button
            onClick={toggleOpen}
            className="mr-2 text-xs text-gray-600 dark:text-gray-300"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
          <span
            className={`${
              thisNodeMatches
                ? isActiveMatch
                  ? activeMatchClass
                  : matchHighlightClass
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {name}:{" "}
            <span className="text-green-700 dark:text-green-400">{`{…}`}</span>
          </span>
        </div>
        {isExpanded &&
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
              expandedPaths={expandedPaths}
              togglePath={togglePath}
              activeMatchPath={activeMatchPath}
              allMatches={allMatches}
            />
          ))}
      </div>
    );
  }

  // Fallback
  return (
    <div style={{ paddingLeft: depth * 12 }} data-nodepath={path}>
      <div
        className={`${baseLineClasses} ${selectedClass} ${hoverClass}`}
        onClick={handleSelect}
      >
        <span className="text-gray-700 dark:text-gray-300">{name}:</span>
        <span className="text-gray-800 dark:text-gray-100">unknown</span>
      </div>
    </div>
  );
}

/* Helpers */
function primitiveColor(v: unknown) {
  switch (typeof v) {
    case "string":
      return "text-red-700 dark:text-red-400";
    case "number":
      return "text-blue-700 dark:text-blue-400";
    case "boolean":
      return "text-purple-700 dark:text-purple-400";
    default:
      return "text-gray-800 dark:text-gray-200";
  }
}

function getPrimitiveString(value: unknown) {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "undefined") {
    return "undefined";
  }
  if (typeof value === "object") {
    return null;
  }
  return String(value);
}
