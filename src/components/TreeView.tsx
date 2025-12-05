import { useCallback, useMemo, useState } from "react";
import TreeNode from "./TreeNode";

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
    <div className="font-mono text-sm p-2 space-y-3">
      {/* Search input */}
      <div className="flex relative gap-2">
        <input
          type="text"
          placeholder="Search keys or values..."
          value={searchInputValue}
          onChange={(e) => onSearchInputChange(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {searchTerm && (
          <button
            className="relative right-8"
            onClick={() => onSearchInputChange("")}
          >
            &#x2715;
          </button>
        )}

        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Expand all nodes"
          >
            Expand All
          </button>

          <button
            onClick={collapseAll}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Collapse all nodes"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Selected path panel */}
      <div className="bg-gray-100 p-2 rounded border text-gray-700">
        <div className="font-semibold text-gray-800 mb-1">Selected Path</div>
        <div className="break-all text-sm">{selectedPath}</div>
      </div>

      {/* Tree root */}
      <div className="bg-white border rounded p-2">
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
