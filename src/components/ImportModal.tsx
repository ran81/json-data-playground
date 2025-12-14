import { useEffect, useRef } from "react";
import { useSimpleFocusTrap } from "../hooks/useSimpleFocusTrap";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (s: string) => void;
};

function ImportModal({ open, onClose, onImport }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current && open) {
      modalRef.current.focus();
    }
  }, [open]);

  useSimpleFocusTrap(modalRef, open);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!open) {
    return null;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      onImport(JSON.stringify(json, null, 2));
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Invalid JSON file");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-96 text-gray-900 dark:text-gray-100"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-xl font-bold mb-4">Import JSON</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose a <code>.json</code> file from your computer.
        </p>

        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-900 dark:text-gray-100"
        />

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
