import type { TsType } from "./types";

export type TypeRegistry = {
  definitions: Map<string, TsType>;
};

export function createRegistry(): TypeRegistry {
  return { definitions: new Map() };
}

/**
 * Infer a TsType from a value.
 * - rootName: used for root object or element naming
 * - isRoot: whether this is the top-level value
 */
export function inferType(
  value: unknown,
  registry: TypeRegistry,
  parentKey: string = "Root",
  isRoot: boolean = true
): TsType {
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

    // Infer element types
    const elementTypes = value.map((v) =>
      inferType(v, registry, singularize(parentKey), false)
    );
    return unifyArrayTypes(elementTypes);
  }

  // Object
  const obj = value as Record<string, unknown>;
  const fields: Record<string, TsType> = {};
  for (const key of Object.keys(obj)) {
    fields[key] = inferType(obj[key], registry, capitalize(key), false);
  }

  const objectType: TsType = { kind: "object", fields };

  // Only register nested objects (not the root object)
  if (!isRoot) {
    registry.definitions.set(parentKey, objectType);
    return { kind: "ref", name: parentKey };
  }

  return objectType;
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
  const unique: TsType[] = [];
  for (const t of types) {
    if (!unique.some((u) => JSON.stringify(u) === JSON.stringify(t))) {
      unique.push(t);
    }
  }
  return unique;
}

// Helpers for naming
function capitalize(str: string): string {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
}

// Simple singularize for array elements: "users" → "User"
function singularize(str: string): string {
  if (!str) return str;
  if (str.endsWith("s") && str.length > 1) {
    return capitalize(str.slice(0, -1));
  }
  return capitalize(str);
}
