import { XMarkIcon } from "@heroicons/react/24/solid";
import CopyButton from "./CopyButton";

function SelectedPathPanel({
  selectedPath,
  changeSelectedPath,
}: {
  selectedPath: string;
  changeSelectedPath: (p: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 relative">
      {/* Header: title + copy button */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 font-sans">
          Selected Path
        </h2>
        <CopyButton text={selectedPath} tooltip="Copy path" />
      </div>

      {/* Path display */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 break-all text-sm text-gray-700 dark:text-gray-300">
          <span>{selectedPath || "-"}</span>

          {selectedPath && (
            <button
              onClick={() => changeSelectedPath("")}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors duration-150"
              aria-label="Clear selected path"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectedPathPanel;
