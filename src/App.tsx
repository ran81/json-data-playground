import { useState } from "react";
import { useJsonState } from "./hooks/useJsonState";
import JsonEditor from "./components/JsonEditor";
import ErrorBox from "./components/ErrorBox";
import TypeOutput from "./components/TypeOutput";
import TreeView from "./components/TreeView";

function App() {
  const { text, setText, parsedJson, error } = useJsonState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState("Root");

  const handleClear = () => {
    setText("");
    setSearchTerm("");
    setSelectedPath("Root");
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Title */}
      <header className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          JSON Data Playground
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit, explore, and visualize JSON data in real time
        </p>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Left panel */}
        <div className="w-1/2 border-r border-gray-200 p-4 flex flex-col gap-4 h-[91vh]">
          <JsonEditor value={text} onChange={setText} onClear={handleClear} />
        </div>

        {/* Right panel */}
        <div className="w-1/2 h-full p-4 overflow-y-auto flex flex-col gap-4">
          <ErrorBox error={error} />
          <TreeView
            value={parsedJson}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
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
