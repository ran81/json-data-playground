import { startTransition, useMemo } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import TreeNode from "./TreeNode";
import SelectedPathPanel from "./SelectedPathPanel";
import { useSearchWorker } from "../hooks/useSearchWorker";
import { getAllExpandablePaths } from "../lib/jsonUtils";

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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Worker hook (matches come from worker)
  const { result, search } = useSearchWorker(); // <-- matches: result.paths, result.count, result.autoExpandedPaths

  // local UI state for match navigation
  const [matchIndex, setMatchIndex] = useState(0);

  // Expand/collapse state (local)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Auto-expanded paths (from worker result) as a result of matches
  const [autoExpandedPaths, setAutoExpandedPaths] = useState<Set<string>>(
    new Set()
  );

  // Reset matchIndex when matches change
  useEffect(() => {
    startTransition(() => {
      setMatchIndex(0);
    });
  }, [result.paths]);

  // Call the worker when searchTerm (debounced) or value changes
  useEffect(() => {
    const term = searchTerm.trim();

    // Empty search → reset UI only
    if (!term) {
      startTransition(() => {
        setAutoExpandedPaths(new Set());
        setMatchIndex(0);
      });
      return;
    }

    // Non-empty search → call worker
    search(value, term);
  }, [searchTerm, value, search]);

  // When the worker `result` updates, apply auto-expanded paths (in a transition)
  useEffect(() => {
    startTransition(() => {
      setAutoExpandedPaths(result.autoExpandedPaths ?? new Set());
      // ensure matchIndex is within bounds
      setMatchIndex((prev) =>
        result.paths.length === 0 ? 0 : Math.min(prev, result.paths.length - 1)
      );
    });
  }, [result]);

  // Ctrl+F or Cmd+F -> focus search input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Toggle expand/collapse for a single path
  const togglePath = useCallback((p: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(p)) {
        next.delete(p);
      } else {
        next.add(p);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedPaths(getAllExpandablePaths(value));
  }, [value]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const mergedExpandedPaths = useMemo(() => {
    return new Set([...expandedPaths, ...autoExpandedPaths]);
  }, [expandedPaths, autoExpandedPaths]);

  const matchesSet = useMemo(() => {
    return new Set(result.paths ?? []);
  }, [result.paths]);

  // Compute active match path and friendly count
  const matches = result.paths ?? [];
  const matchCount = result.count ?? matchesSet.size;
  const currentMatchPath = matches[matchIndex] ?? null;

  return (
    <div className="font-mono p-3 space-y-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="flex relative w-full">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search keys or values..."
            value={searchInputValue}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && matches.length > 0) {
                let idx = matchIndex;
                if (e.shiftKey) {
                  idx = (idx - 1 + matches.length) % matches.length;
                } else {
                  idx = (idx + 1) % matches.length;
                }
                setMatchIndex(idx);

                document
                  .querySelector(`[data-nodepath="${matches[idx]}"]`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="w-full p-2 pr-16 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />

          {/* Next (▼) */}
          {searchInputValue && matches.length > 0 && (
            <>
              <button
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
                onClick={() => {
                  const idx = (matchIndex + 1) % matches.length;
                  setMatchIndex(idx);
                  document
                    .querySelector(`[data-nodepath="${matches[idx]}"]`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                aria-label="Next match"
                title="Next match"
              >
                ▼
              </button>

              {/* Previous (▲) */}
              <button
                className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
                onClick={() => {
                  const idx =
                    (matchIndex - 1 + matches.length) % matches.length;
                  setMatchIndex(idx);
                  document
                    .querySelector(`[data-nodepath="${matches[idx]}"]`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                aria-label="Previous match"
                title="Previous match"
              >
                ▲
              </button>
            </>
          )}

          {/* Clear */}
          {searchInputValue && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
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
            className="px-3 py-1 text-gray-800 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
            title="Expand all nodes"
          >
            Expand
          </button>

          <button
            onClick={collapseAll}
            className="px-3 py-1 text-gray-800 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
            title="Collapse all nodes"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Selected path panel */}
      <SelectedPathPanel
        selectedPath={selectedPath}
        changeSelectedPath={onSelectPath}
      />

      {/* Match count */}
      {searchInputValue && (
        <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
          {result.paths.length === 0 && result.count === 0
            ? "No matches"
            : `Showing match ${matchIndex + 1} of ${matchCount}`}
        </div>
      )}

      {/* Tree root */}
      <div className="max-h-[57vh] overflow-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100">
        <TreeNode
          name="Root"
          value={value}
          depth={0}
          path="Root"
          selectedPath={selectedPath}
          onSelectPath={onSelectPath}
          // Expanded path include both the ones opened manually
          // and the ones opened cause of matches
          expandedPaths={mergedExpandedPaths}
          togglePath={togglePath}
          activeMatchPath={currentMatchPath}
          allMatchesSet={matchesSet}
        />
      </div>
    </div>
  );
}
