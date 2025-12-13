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

        <button
          onClick={toggleDarkMode}
          className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "🌞" : "🌙"}
        </button>
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
