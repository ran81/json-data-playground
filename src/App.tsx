// src/App.tsx
import { useState } from "react";

import JsonEditor from "./components/JsonEditor/JsonEditor";
import TypeOutput from "./components/TypeOutput/TypeOutput";
import ErrorBox from "./components/ErrorBox";
import ChartView from "./components/ChartView/ChartView";
import TreeView from "./components/TreeView/TreeView";

import { useJsonState } from "./hooks/useJsonState";

function App() {
  const { text, setText, parsedJson, error } = useJsonState();

  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Left */}
      <div className="w-1/2 h-full border-r border-gray-200 p-4 flex flex-col gap-4">
        <JsonEditor value={text} onChange={setText} />
      </div>

      {/* Right */}
      <div className="w-1/2 h-full p-4 overflow-y-auto flex flex-col gap-4">
        <ErrorBox error={error} />
        <TypeOutput value={parsedJson} />
        <ChartView value={parsedJson} />
        <TreeView value={parsedJson} />
      </div>
    </div>
  );
}

export default App;
