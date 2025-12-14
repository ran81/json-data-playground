import { lazy, Suspense, useEffect, useState } from "react";
import { useJsonState } from "./hooks/useJsonState";
import { useResize } from "./hooks/useResize";
import ErrorBox from "./components/ErrorBox";
import TypeOutput from "./components/TypeOutput";
import TreeView from "./components/TreeView";
import { LS_KEY_THEME } from "./constants";

const LazyJsonEditor = lazy(() => import("./components/JsonEditor"));

function App() {
  const { text, setText, parsedJson, error, stats } = useJsonState();

  const { width: leftWidth, startResize } = useResize({ initialWidth: 50 });

  // immediate input value shown in the search box
  const [inputSearch, setInputSearch] = useState("");

  // debounced value used by TreeView
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedPath, setSelectedPath] = useState("Root");

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      // If window is undefined (SSR), default to false
      if (typeof window === "undefined") {
        return false;
      }

      const saved = localStorage.getItem(LS_KEY_THEME);
      if (saved !== null) {
        return saved === "true";
      }

      // fallback to system preference
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? true
        : false;
    } catch {
      return false;
    }
  });

  // Apply body class and persist to localStorage when darkMode changes
  useEffect(() => {
    try {
      if (darkMode) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }

      localStorage.setItem(LS_KEY_THEME, String(darkMode));
    } catch {
      // ignore (e.g. storage disabled)
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((d) => !d);
  };

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(inputSearch);
    }, 700);

    return () => clearTimeout(id);
  }, [inputSearch]);

  const handleClear = () => {
    setText("");
    setInputSearch("");
    setSelectedPath("Root");
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Title */}
      <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            JSON Playground
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Edit, explore, and visualize JSON data in real time
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <a
            href="https://github.com/ran81/json-data-playground"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
            title="View on GitHub"
            className="w-5 h-5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M12 0.296C5.373 0.296 0 5.669 0 12.296c0 5.292 3.438 9.772 8.205 11.366.6.111.82-.261.82-.58 0-.286-.01-1.04-.016-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.833 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.334-5.466-5.934 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.137 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.655 1.653.243 2.873.119 3.176.77.84 1.236 1.91 1.236 3.221 0 4.61-2.804 5.627-5.476 5.924.43.37.814 1.1.814 2.222 0 1.606-.014 2.902-.014 3.293 0 .321.218.697.825.579C20.565 22.065 24 17.585 24 12.296 24 5.669 18.627.296 12 .296z" />
            </svg>
          </a>
          <button
            onClick={toggleDarkMode}
            className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 relative bg-gray-50 dark:bg-gray-900">
        {/* Left panel */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 h-[89vh] bg-gray-50 dark:bg-gray-900"
        >
          <Suspense
            fallback={<div className="p-4 text-gray-500">Loading editor…</div>}
          >
            <LazyJsonEditor
              value={text}
              onChange={setText}
              onClear={handleClear}
              stats={stats}
              darkMode={darkMode}
            />
          </Suspense>
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={startResize}
          onTouchStart={startResize}
          onMouseDownCapture={(e) => e.preventDefault()} // prevents text selection jump
          onTouchStartCapture={(e) => e.preventDefault()}
          className="w-1 cursor-col-resize bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
        />

        {/* Right panel */}
        <div
          style={{
            width: `${100 - leftWidth}%`,
          }}
          className="h-full p-4 overflow-y-auto flex flex-col gap-4 bg-white dark:bg-gray-900"
        >
          <ErrorBox error={error} />
          <TreeView
            value={parsedJson}
            searchInputValue={inputSearch}
            onSearchInputChange={setInputSearch}
            searchTerm={debouncedSearch}
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
          />
          <TypeOutput value={parsedJson} />
        </div>
      </div>
    </div>
  );
}

export default App;
