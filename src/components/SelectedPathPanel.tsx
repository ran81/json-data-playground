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
    <div className="bg-gray-100 p-2 rounded border text-gray-700 relative">
      <div className="flex justify-between">
        <h2 className="font-semibold text-gray-800 mb-1">Selected Path</h2>
        <CopyButton text={selectedPath} tooltip="Copy path" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex items-center gap-2 break-all text-sm">
          <span>{selectedPath || "-"}</span>

          {selectedPath && (
            <button
              onClick={() => changeSelectedPath("")}
              className="text-gray-500 hover:text-gray-700 p-0.5 rounded"
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
