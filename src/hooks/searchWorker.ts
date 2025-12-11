import { collectAutoExpandedPaths, collectMatchPaths } from "../lib/jsonUtils";

type RequestMsg = {
  id: number;
  value: unknown;
  term: string;
};

type ResponseMsg = {
  id: number;
  paths: string[];
  count: number;
  autoExpandedPaths: string[]; // array so it's serializable
};

self.onmessage = (ev: MessageEvent) => {
  const msg = ev.data as RequestMsg;
  const { id, value, term } = msg;

  if (!term || !term.trim()) {
    // early return
    const resp: ResponseMsg = {
      id,
      paths: [],
      count: 0,
      autoExpandedPaths: [],
    };
    self.postMessage(resp);
    return;
  }

  try {
    const paths: string[] = [];
    collectMatchPaths(value, "Root", term.trim(), paths);
    const count = paths.length;
    const autoExpandedPaths = collectAutoExpandedPaths(value, term);

    const resp: ResponseMsg = { id, paths, count, autoExpandedPaths };
    self.postMessage(resp);
  } catch (err: unknown) {
    console.log(err);
    // avoid crashing worker: send an empty result
    const resp: ResponseMsg = {
      id,
      paths: [],
      count: 0,
      autoExpandedPaths: [],
    };
    self.postMessage(resp);
  }
};
