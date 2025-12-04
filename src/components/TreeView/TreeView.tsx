import React, { useState } from "react";
import TreeNode from "./TreeNode";

type Props = {
  value: unknown;
};

export default function TreeView({ value }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState<string>("Root");

  return (
    <div className="font-mono text-sm p-2 space-y-3">
      {/* Search input */}
      <div className="flex relative">
        <input
          type="text"
          placeholder="Search keys or values..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {searchTerm && (
          <button
            className="relative right-5"
            onClick={() => setSearchTerm("")}
          >
            &#x2715;
          </button>
        )}
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
          onSelectPath={setSelectedPath}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
}
