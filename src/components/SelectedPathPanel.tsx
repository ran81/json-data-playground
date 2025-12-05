import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

function SelectedPathPanel({
  selectedPath,
  changeSelectedPath,
}: {
  selectedPath: string;
  changeSelectedPath: (p: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="bg-gray-100 p-2 rounded border text-gray-700 relative">
      <div className="font-semibold text-gray-800 mb-1">Selected Path</div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex items-center gap-2 break-all text-sm">
          <span>{selectedPath || "-"}</span>

          {selectedPath && (
            <button
              onClick={() => changeSelectedPath("")}
              className="text-gray-500 hover:text-gray-700 p-0.5 rounded"
              aria-label="Clear selected path"
            >
              ×
            </button>
          )}
        </div>

        {/* Copy button */}
        <div className="relative flex-shrink-0">
          {/* Tooltip */}
          <div
            className={`absolute -top-6 right-1/2 translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded shadow-md whitespace-nowrap z-10
          transition-opacity duration-200
          ${
            hovered && !copied ? "opacity-100" : "opacity-0 pointer-events-none"
          }
        `}
          >
            Copy path
          </div>

          <button
            onClick={handleCopy}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="p-1 rounded hover:bg-gray-200 relative"
            aria-label="Copy path"
          >
            {/* Smooth icon transition */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200
            ${copied ? "opacity-100" : "opacity-0"}
          `}
            >
              <CheckIcon className="w-4 h-4 text-green-500" />
            </span>
            <span
              className={`flex items-center justify-center transition-opacity duration-200
            ${copied ? "opacity-0" : "opacity-100"}
          `}
            >
              <ClipboardIcon className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectedPathPanel;
