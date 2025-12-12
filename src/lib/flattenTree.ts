export type FlatNode = {
  name: string;
  value: unknown;
  depth: number;
  path: string;
  isLeaf: boolean;
};

/**
 * Flattens a nested object/array into a flat array of nodes for react-window.
 */
export function flattenTree(
  value: unknown,
  expandedPaths: Set<string>,
  path = "Root",
  depth = 0
): FlatNode[] {
  const nodes: FlatNode[] = [];

  // Always create a node for the current value
  const node: FlatNode = {
    name: path.split(/[.[\]]/).pop() || path,
    value,
    depth,
    path,
    isLeaf: value === null || typeof value !== "object", // null / primitive / undefined
  };

  nodes.push(node);

  // Only recurse if value is a non-null object/array AND expanded
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);

  if (isObject && expandedPaths.has(path)) {
    if (isArray) {
      for (let i = 0; i < value.length; i++) {
        nodes.push(
          ...flattenTree(value[i], expandedPaths, `${path}[${i}]`, depth + 1)
        );
      }
    } else {
      for (const [key, val] of Object.entries(value)) {
        nodes.push(
          ...flattenTree(val, expandedPaths, `${path}.${key}`, depth + 1)
        );
      }
    }
  }

  return nodes;
}
