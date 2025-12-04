import type { TsType } from "./types";

export function inferType(value: unknown): TsType {
  if (value === null) return { kind: "null" };

  const t = typeof value;

  if (t === "string") return { kind: "string" };
  if (t === "number") return { kind: "number" };
  if (t === "boolean") return { kind: "boolean" };
  if (t !== "object") return { kind: "unknown" };

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0)
      return { kind: "array", element: { kind: "unknown" } };

    const elementTypes = value.map(inferType);
    return unifyArrayTypes(elementTypes);
  }

  // Object
  const obj = value as Record<string, unknown>;
  const fields: Record<string, TsType> = {};

  for (const key of Object.keys(obj)) {
    fields[key] = inferType(obj[key]);
  }

  return { kind: "object", fields };
}

// Merge array element types into a single TsType
function unifyArrayTypes(types: TsType[]): TsType {
  // All elements same?
  const first = JSON.stringify(types[0]);
  const allSame = types.every((t) => JSON.stringify(t) === first);

  if (allSame) {
    return { kind: "array", element: types[0] };
  }

  return {
    kind: "array",
    element: { kind: "union", types: mergeUnion(types) },
  };
}

function mergeUnion(types: TsType[]): TsType[] {
  // Deduplicate structural equals
  const unique: TsType[] = [];
  for (const t of types) {
    if (!unique.some((u) => JSON.stringify(u) === JSON.stringify(t))) {
      unique.push(t);
    }
  }
  return unique;
}
