import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

function CopyButton({ text, tooltip }: { text: string; tooltip: string }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="relative flex-shrink-0">
      {/* Tooltip */}
      <div
        className={`absolute -top-6 right-1/2 translate-x-1/2 px-2 py-1 text-xs bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 rounded shadow-md whitespace-nowrap z-10
      transition-opacity duration-200
      ${hovered && !copied ? "opacity-100" : "opacity-0 pointer-events-none"}
    `}
      >
        {tooltip}
      </div>

      <button
        onClick={handleCopy}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 relative transition-colors duration-150"
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
          <ClipboardIcon className="w-4 h-4 dark:text-white" />
        </span>
      </button>
    </div>
  );
}

export default CopyButton;
