import { useCallback, useEffect, useRef, useState } from "react";

// choose one creation method depending on your bundler:
// 1) If your bundler supports import.meta.url for workers (Vite):
// const worker = new Worker(new URL("./searchWorker.ts", import.meta.url), { type: "module" });

// 2) If not, we'll create a blob worker at runtime (fallback). This is slower to instantiate but works always.

function createWorker(): Worker {
  // Try new URL method first - use try/catch in case bundler rejects it.
  try {
    return new Worker(new URL("./searchWorker.ts", import.meta.url), {
      type: "module",
    });
  } catch (err) {
    console.log(err);
    // Fallback: fetch the worker file text via an inline string (embedding the worker code)
    // For simplicity embed minimal worker implementation as string below.
    const workerCode = `
      ${
        /* Paste the worker code string here if you want a single-file fallback.
           For clarity I recommend using the separate file and bundler-based worker.
           But here's a small runtime fallback that uses same logic. */ ""
      }
      self.onmessage = function(ev) {
        const msg = ev.data;
        const id = msg.id;
        const value = msg.value;
        const term = msg.term;
        if (!term || !String(term).trim()) {
          self.postMessage({ id, paths: [], count: 0, autoExpandedPaths: [] });
          return;
        }

        // For fallback: simple traversal (less code). If you prefer, paste full logic.
        function collectMatchPaths(v, path, termLower, acc) {
          const name = path.split('.').pop() || '';
          if (name.toLowerCase().includes(termLower)) acc.push(path);
          if (v === null) {
            if ('null'.includes(termLower)) acc.push(path);
            return;
          }
          if (typeof v !== 'object') {
            if (String(v).toLowerCase().includes(termLower)) acc.push(path);
            return;
          }
          if (Array.isArray(v)) {
            for (let i=0;i<v.length;i++) collectMatchPaths(v[i], path + '['+i+']', termLower, acc);
          } else {
            for (const k in v) collectMatchPaths(v[k], path + '.' + k, termLower, acc);
          }
        }

        const acc = [];
        collectMatchPaths(value, 'Root', String(term).toLowerCase(), acc);
        self.postMessage({ id, paths: acc, count: acc.length, autoExpandedPaths: [] });
      };
    `;
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    return new Worker(url);
  }
}

type WorkerPayload = {
  id: number;
  paths: string[];
  count: number;
  autoExpandedPaths: string[];
};

export function useSearchWorker() {
  const workerRef = useRef<Worker | null>(null);
  const nextIdRef = useRef(1);
  const latestReqIdRef = useRef(0);

  const [result, setResult] = useState<{
    paths: string[];
    count: number;
    autoExpandedPaths: Set<string>;
  }>({
    paths: [],
    count: 0,
    autoExpandedPaths: new Set(),
  });

  useEffect(() => {
    const w = createWorker();
    workerRef.current = w;

    w.onmessage = (ev: MessageEvent) => {
      const { id, paths, count, autoExpandedPaths } = ev.data as WorkerPayload;

      // Ignore stale responses
      if (id < latestReqIdRef.current) return;

      latestReqIdRef.current = id;
      setResult({
        paths,
        count,
        autoExpandedPaths: new Set(autoExpandedPaths),
      });
    };

    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const search = useCallback((value: unknown, term: string) => {
    if (!workerRef.current) {
      return;
    }
    const id = nextIdRef.current++;
    latestReqIdRef.current = id;
    workerRef.current.postMessage({ id, value, term });
  }, []);

  return { result, search };
}
