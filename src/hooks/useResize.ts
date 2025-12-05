import { useState, useEffect, useCallback } from "react";

type UseResizeOptions = {
  initialWidth?: number; // in percentage
  minWidth?: number; // in percentage
  maxWidth?: number; // in percentage
};

export function useResize({
  initialWidth = 50,
  minWidth = 20,
  maxWidth = 80,
}: UseResizeOptions = {}) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = () => setIsResizing(true);

  const stopResize = useCallback(() => setIsResizing(false), []);

  const handleMove = useCallback(
    (clientX: number) => {
      const newWidth = (clientX / window.innerWidth) * 100;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    },
    [minWidth, maxWidth]
  );

  useEffect(() => {
    if (!isResizing) return;

    // disable text selection
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault(); // prevent accidental text selection
      handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", stopResize);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopResize);
    };
  }, [isResizing, handleMove, stopResize]);

  return { width, startResize };
}
