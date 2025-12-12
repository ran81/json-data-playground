import React from "react";
import type { FlatNode } from "../lib/flattenTree";

type Props = {
  node: FlatNode;
  expandedPaths: Set<string>;
  togglePath: (path: string) => void;
  selectedPath: string;
  onSelectPath: (path: string) => void;
  activeMatchPath?: string | null;
  allMatchesSet?: Set<string>;
};

export default function NodeRow({
  node,
  expandedPaths,
  togglePath,
  selectedPath,
  onSelectPath,
  activeMatchPath,
  allMatchesSet,
}: Props) {
  const isSelected = selectedPath === node.path;
  const isExpanded = expandedPaths.has(node.path);

  const pathMatchedByWorker = allMatchesSet
    ? allMatchesSet.has(node.path)
    : false;
  const isActiveMatch = activeMatchPath === node.path;
  const thisNodeMatches = pathMatchedByWorker;

  const isExpandable = !node.isLeaf;

  const baseLineClasses =
    "flex items-center cursor-pointer rounded px-2 py-0.5 transition-all duration-150";
  const selectedClass = isSelected
    ? "bg-blue-100 dark:bg-blue-700 shadow-sm"
    : "";
  const hoverClass = !isSelected
    ? "hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-sm"
    : "";
  const matchHighlightClass = thisNodeMatches
    ? "bg-yellow-200 dark:bg-yellow-500 rounded px-1 dark:!text-black"
    : "";
  const activeMatchClass = isActiveMatch
    ? "bg-yellow-300 dark:bg-yellow-400 ring-1 ring-yellow-400 rounded px-1 dark:!text-black"
    : "";

  const handleSelect = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onSelectPath(node.path);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpandable) {
      togglePath(node.path);
    }
    onSelectPath(node.path);
  };

  const keyClassForNode = (extra = "") =>
    `${extra} mr-2 text-gray-700 dark:text-gray-300 ${
      thisNodeMatches
        ? isActiveMatch
          ? activeMatchClass
          : matchHighlightClass
        : ""
    }`;

  const valueAsString = getPrimitiveString(node.value);

  return (
    <div
      style={{ paddingLeft: node.depth * 12 }}
      className={`${baseLineClasses} ${selectedClass} ${hoverClass}`}
      onClick={handleSelect}
    >
      {/* Expand/Collapse button */}
      {isExpandable ? (
        <button
          onClick={handleToggle}
          className="mr-2 text-xs text-gray-600 dark:text-gray-300"
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      ) : (
        <div className="w-4 mr-2" /> // placeholder for alignment
      )}

      {/* Key / name */}
      <span className={keyClassForNode("")}>{node.name}:</span>

      {/* Value */}
      {node.isLeaf && (
        <span
          className={`${primitiveColor(node.value)} ${
            thisNodeMatches
              ? isActiveMatch
                ? activeMatchClass + " text-gray-900 dark:text-gray-100"
                : matchHighlightClass + " text-gray-900 dark:text-gray-100"
              : ""
          }`}
        >
          {valueAsString}
        </span>
      )}

      {/* Non-leaf types */}
      {!node.isLeaf && (
        <span className={`ml-1 text-gray-500 dark:text-gray-400`}>
          {Array.isArray(node.value) ? `Array(${node.value.length})` : "{…}"}
        </span>
      )}
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
