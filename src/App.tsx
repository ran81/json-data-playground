import { useEffect, useState } from "react";
import { useJsonState } from "./hooks/useJsonState";
import JsonEditor from "./components/JsonEditor";
import ErrorBox from "./components/ErrorBox";
import TypeOutput from "./components/TypeOutput";
import TreeView from "./components/TreeView";
import { useResize } from "./hooks/useResize";

function App() {
  const { text, setText, parsedJson, error, stats } = useJsonState();

  // immediate input value shown in the search box
  const [inputSearch, setInputSearch] = useState("");

  // debounced value used by TreeView
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedPath, setSelectedPath] = useState("Root");

  const { width: leftWidth, startResize } = useResize({ initialWidth: 50 });

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(inputSearch);
    }, 200);

    return () => clearTimeout(id);
  }, [inputSearch]);

  const handleClear = () => {
    setText("");
    setInputSearch("");
    setSelectedPath("Root");
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Title */}
      <header className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">JSON Playground</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit, explore, and visualize JSON data in real time
        </p>
      </header>

      {/* Main content */}
      <div className="flex flex-1 relative">
        {/* Left panel */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="border-r border-gray-200 p-4 flex flex-col gap-4 h-[90vh]"
        >
          <JsonEditor
            value={text}
            onChange={setText}
            onClear={handleClear}
            stats={stats}
          />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={startResize}
          onTouchStart={startResize}
          onMouseDownCapture={(e) => e.preventDefault()} // prevents text selection jump
          onTouchStartCapture={(e) => e.preventDefault()}
          className="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-400"
        />

        {/* Right panel */}
        <div
          style={{
            width: `${100 - leftWidth}%`,
          }}
          className="h-full p-4 overflow-y-auto flex flex-col gap-4"
        >
          <ErrorBox error={error} />
          <TreeView
            value={parsedJson}
            // show immediate input in the search box
            searchInputValue={inputSearch}
            onSearchInputChange={setInputSearch}
            // pass debounced value to drive tree behavior
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
