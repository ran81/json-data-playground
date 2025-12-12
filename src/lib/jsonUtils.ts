// Collect expandable paths
export function getAllExpandablePaths(rootValue: unknown): Set<string> {
  const result = new Set<string>();

  function walk(v: unknown, path: string) {
    if (v === null || typeof v !== "object") return;

    result.add(path);

    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        walk(v[i], `${path}[${i}]`);
      }
    } else {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        walk(val, `${path}.${k}`);
      }
    }
  }

  walk(rootValue, "Root");
  return result;
}

// Collect all paths that match the term starting from path
export function collectMatchPaths(
  v: unknown,
  path: string,
  term: string,
  acc: string[]
) {
  const lower = term.toLowerCase();

  function isMatch(candidateValue: unknown, name: string) {
    const nm = (name || "").toLowerCase();
    if (nm.includes(lower)) return true;
    if (candidateValue === null) return "null".includes(lower);
    if (typeof candidateValue !== "object")
      return String(candidateValue).toLowerCase().includes(lower);
    return false;
  }

  const name = path.split(".").pop() || "";
  if (isMatch(v, name)) acc.push(path);

  if (v && typeof v === "object") {
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        collectMatchPaths((v as unknown[])[i], `${path}[${i}]`, term, acc);
      }
    } else {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        collectMatchPaths(val, `${path}.${k}`, term, acc);
      }
    }
  }
}

// Return array of paths that should be auto-expanded
export function collectAutoExpandedPaths(rootValue: unknown, term: string) {
  if (!term.trim()) return [];

  const lower = term.trim().toLowerCase();
  const result = new Set<string>();

  function matches(v: unknown, name: string): boolean {
    if (name.toLowerCase().includes(lower)) return true;
    if (v === null) return "null".includes(lower);
    if (typeof v !== "object") return String(v).toLowerCase().includes(lower);

    if (Array.isArray(v)) {
      return v.some((child, i) => matches(child, String(i)));
    }

    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (matches(val, k)) return true;
    }
    return false;
  }

  function walk(value: unknown, path: string) {
    if (value === null || typeof value !== "object") return;

    if (matches(value, path.split(".").pop() || "")) {
      result.add(path);
    }

    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${path}[${i}]`));
    } else {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        walk(v, `${path}.${k}`);
      }
    }
  }

  walk(rootValue, "Root");
  return Array.from(result);
}
