import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  startTransition,
} from "react";
import { List, useDynamicRowHeight, useListRef } from "react-window";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getAllExpandablePaths } from "../lib/jsonUtils";
import { flattenTree, type FlatNode } from "../lib/flattenTree";
import NodeRow from "./NodeRow";
import SelectedPathPanel from "./SelectedPathPanel";
import { useSearchWorker } from "../hooks/useSearchWorker";

type Props = {
  value: unknown;
  searchInputValue: string;
  onSearchInputChange: (v: string) => void;
  searchTerm: string;
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
  const listRef = useListRef(null);
  const { result, search } = useSearchWorker();
  const [matchIndex, setMatchIndex] = useState(0);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [autoExpandedPaths, setAutoExpandedPaths] = useState<Set<string>>(
    new Set()
  );

  // Reset matchIndex when matches change
  useEffect(() => startTransition(() => setMatchIndex(0)), [result.paths]);

  // Call worker when searchTerm or value changes
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      startTransition(() => {
        // Remove this line to prevent auto-collapse of nodes when
        // search is cleared
        setAutoExpandedPaths(new Set());
        setMatchIndex(0);
      });
      search(value, "");
      return;
    }
    search(value, term);
  }, [searchTerm, value, search]);

  // Apply auto-expanded paths from search
  useEffect(() => {
    startTransition(() => {
      if (result.autoExpandedPaths.size > 0) {
        setAutoExpandedPaths(result.autoExpandedPaths);
      }
      setMatchIndex((prev) =>
        result.paths.length === 0 ? 0 : Math.min(prev, result.paths.length - 1)
      );
    });
  }, [result]);

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

  const mergedExpandedPaths = useMemo(
    () => new Set([...expandedPaths, ...autoExpandedPaths]),
    [expandedPaths, autoExpandedPaths]
  );

  const matchesSet = useMemo(() => new Set(result.paths ?? []), [result.paths]);

  const togglePath = useCallback((p: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }, []);

  const expandAll = useCallback(
    () => setExpandedPaths(getAllExpandablePaths(value)),
    [value]
  );

  const collapseAll = useCallback(() => {
    setAutoExpandedPaths(new Set());
    setExpandedPaths(new Set());
  }, []);

  // Flatten tree into visible nodes for virtualization
  const visibleNodes: FlatNode[] = useMemo(
    () => flattenTree(value, mergedExpandedPaths),
    [value, mergedExpandedPaths]
  );

  const rowHeight = useDynamicRowHeight({
    defaultRowHeight: 28,
  });

  // Scroll to selected path when it changes
  useEffect(() => {
    if (!selectedPath || !listRef.current) {
      return;
    }
    const index = visibleNodes.findIndex((n) => n.path === selectedPath);
    if (index >= 0) {
      listRef.current.scrollToRow({
        align: "center",
        behavior: "smooth",
        index,
      });
    }
  }, [selectedPath, visibleNodes, listRef]);

  const matches = result.paths ?? [];
  const matchCount = result.count ?? matchesSet.size;
  const currentMatchPath = matches[matchIndex] ?? null;

  const goToNextMatch = () => {
    if (!listRef.current || matches.length === 0) {
      return;
    }

    const nextIndex = (matchIndex + 1) % matches.length;
    setMatchIndex(nextIndex);

    const nodeIndex = visibleNodes.findIndex(
      (n) => n.path === matches[nextIndex]
    );
    if (nodeIndex >= 0) {
      listRef.current.scrollToRow({
        index: nodeIndex,
        align: "center",
        behavior: "instant",
      });
    }
  };

  const goToPrevMatch = () => {
    if (!listRef.current || matches.length === 0) {
      return;
    }

    const prevIndex = (matchIndex - 1 + matches.length) % matches.length;
    setMatchIndex(prevIndex);

    const nodeIndex = visibleNodes.findIndex(
      (n) => n.path === matches[prevIndex]
    );
    if (nodeIndex >= 0) {
      listRef.current.scrollToRow({
        index: nodeIndex,
        align: "center",
        behavior: "instant",
      });
    }
  };

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
                idx = e.shiftKey
                  ? (idx - 1 + matches.length) % matches.length
                  : (idx + 1) % matches.length;
                setMatchIndex(idx);
                if (!e.shiftKey) {
                  goToNextMatch();
                } else {
                  goToPrevMatch();
                }
              }
            }}
            className="w-full p-2 pr-16 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          {searchInputValue && matches.length > 0 && (
            <>
              <button
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
                onClick={() => {
                  const idx = (matchIndex + 1) % matches.length;
                  setMatchIndex(idx);
                  goToNextMatch();
                }}
                aria-label="Next match"
              >
                ▼
              </button>
              <button
                className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
                onClick={() => {
                  const idx =
                    (matchIndex - 1 + matches.length) % matches.length;
                  setMatchIndex(idx);
                  goToPrevMatch();
                }}
                aria-label="Previous match"
              >
                ▲
              </button>
            </>
          )}
          {searchInputValue && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
              onClick={() => onSearchInputChange("")}
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
          >
            Expand
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 text-gray-800 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
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
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100">
        <List
          listRef={listRef}
          rowComponent={({ index, style, ...rest }) => (
            <div style={style} key={visibleNodes[index].path}>
              <NodeRow node={visibleNodes[index]} {...rest} />
            </div>
          )}
          rowCount={visibleNodes.length}
          rowHeight={rowHeight}
          rowProps={{
            expandedPaths: mergedExpandedPaths,
            togglePath,
            selectedPath,
            onSelectPath,
            activeMatchPath: currentMatchPath,
            allMatchesSet: matchesSet,
          }}
          style={{ height: "55vh", width: "100%" }}
        />
      </div>
    </div>
  );
}
