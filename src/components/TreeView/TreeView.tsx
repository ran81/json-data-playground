import { useState } from "react";
import { TreeNode } from "./TreeNode";

type Props = {
  value: unknown;
};

export default function TreeView({ value }: Props) {
  const [selectedPath, setSelectedPath] = useState<string>("Root");

  return (
    <div className="font-mono text-sm p-2 space-y-2">
      {/* Path Panel */}
      <div className="bg-gray-100 p-2 rounded border text-gray-700">
        <div className="font-semibold text-gray-800 mb-1">Selected Path:</div>
        <div className="break-all">{selectedPath}</div>
      </div>

      {/* Tree */}
      <TreeNode
        name="Root"
        value={value}
        depth={0}
        path="Root"
        selectedPath={selectedPath}
        onSelectPath={setSelectedPath}
      />
    </div>
  );
}
