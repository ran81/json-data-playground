import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import TreeNode from "./TreeNode";
import SelectedPathPanel from "./SelectedPathPanel";

type Props = {
  value: unknown;
  searchInputValue: string; // immediate input shown in box
  onSearchInputChange: (v: string) => void; // updates inputValue
  searchTerm: string; // debounced term used for tree logic
  selectedPath: string;
  onSelectPath: (path: string) => void;
};

export default function TreeView({
  value,
  searchTerm,
  searchInputValue,
  onSearchInputChange,
  selectedPath,
  onSelectPath,
}: Props) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const matchCount = countTreeMatches(value, "root", searchTerm);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault(); // prevent browser find
        searchInputRef.current?.focus();
        searchInputRef.current?.select(); // optional: select text
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // toggle a single path
  const togglePath = useCallback((p: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }, []);

  // collect all expandable paths (objects/arrays) from the root
  const collectExpandablePaths = useCallback((rootValue: unknown) => {
    const result = new Set<string>();

    function walk(v: unknown, path: string) {
      if (v === null || typeof v !== "object") return;

      // this path is expandable (object or array)
      result.add(path);

      if (Array.isArray(v)) {
        for (let i = 0; i < v.length; i++) {
          walk(v[i], `${path}[${i}]`);
        }
      } else {
        for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
          walk(val, `${path}.${k}`);
        }
      }
    }

    walk(rootValue, "Root");
    return result;
  }, []);

  const expandAll = useCallback(() => {
    const all = collectExpandablePaths(value);
    setExpandedPaths(all);
  }, [collectExpandablePaths, value]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const autoExpandedPaths = useMemo(() => {
    if (!searchTerm.trim()) return new Set<string>();

    const result = new Set<string>();
    const term = searchTerm.trim().toLowerCase();

    function walk(value: unknown, path: string) {
      if (value === null || typeof value !== "object") return;

      // check if any child matches
      const matches = (v: unknown, name: string): boolean => {
        if (name.toLowerCase().includes(term)) return true;
        if (v === null) return "null".includes(term);
        if (typeof v !== "object")
          return String(v).toLowerCase().includes(term);

        if (Array.isArray(v)) {
          return v.some((child, i) => matches(child, String(i)));
        }

        for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
          if (matches(val, k)) return true;
        }
        return false;
      };

      if (matches(value, path.split(".").pop() || "")) {
        result.add(path); // auto-expand this branch
      }

      // Recurse children
      if (Array.isArray(value)) {
        value.forEach((v, i) => walk(v, `${path}[${i}]`));
      } else {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          walk(v, `${path}.${k}`);
        }
      }
    }

    walk(value, "Root");
    return result;
  }, [value, searchTerm]);

  return (
    <div className="font-mono p-3 space-y-3 bg-white border rounded-lg shadow-sm">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="flex relative w-full">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search keys or values..."
            value={searchInputValue}
            onChange={(e) => onSearchInputChange(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-150"
              onClick={() => {
                onSearchInputChange("");
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 ml-2">
          <button
            onClick={expandAll}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150"
            title="Expand all nodes"
          >
            Expand All
          </button>

          <button
            onClick={collapseAll}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150"
            title="Collapse all nodes"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Selected path panel */}
      <SelectedPathPanel
        selectedPath={selectedPath}
        changeSelectedPath={onSelectPath}
      />

      {/* Match count */}
      {searchTerm && (
        <div className="text-sm text-gray-600 text-right">
          Matches: {matchCount}
        </div>
      )}

      {/* Tree root */}
      <div className="max-h-[60vh] overflow-auto border rounded-lg p-2 bg-gray-50 text-sm">
        <TreeNode
          name="Root"
          value={value}
          depth={0}
          path="Root"
          selectedPath={selectedPath}
          onSelectPath={onSelectPath}
          searchTerm={searchTerm}
          expandedPaths={new Set([...expandedPaths, ...autoExpandedPaths])}
          togglePath={togglePath}
        />
      </div>
    </div>
  );
}

function countTreeMatches(value: unknown, name: string, term: string): number {
  if (!term) {
    return 0;
  }
  const lowerTerm = term.toLowerCase();

  let count = 0;

  // Check key
  if (name.toLowerCase().includes(lowerTerm)) count += 1;

  // Check value (primitive only)
  const valueAsString =
    value !== null && typeof value !== "object" ? String(value) : null;
  if (valueAsString && valueAsString.toLowerCase().includes(lowerTerm))
    count += 1;

  // Recurse into arrays
  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      count += countTreeMatches(v, String(i), term);
    });
  }
  // Recurse into objects
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([k, v]) => {
      count += countTreeMatches(v, k, term);
    });
  }

  return count;
}
