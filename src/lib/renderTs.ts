import type { TsType } from "./types";
import type { TypeRegistry } from "./inferType";

/**
 * Recursively render a TsType to a TypeScript type string.
 */
function renderType(t: TsType, indent = 0): string {
  const pad = "  ".repeat(indent);

  switch (t.kind) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "null":
      return "null";
    case "unknown":
      return "unknown";

    case "array": {
      const el = renderType(t.element, indent);
      if (t.element.kind === "union") {
        return `(${el})[]`;
      }
      return `${el}[]`;
    }

    case "union": {
      return t.types.map((m) => renderType(m, indent)).join(" | ");
    }

    case "object": {
      const entries = Object.entries(t.fields);
      if (entries.length === 0) return "{}";
      const inner = entries
        .map(([k, v]) => `${pad}  ${k}: ${renderType(v, indent + 1)};`)
        .join("\n");
      return `{\n${inner}\n${pad}}`;
    }

    case "ref":
      return t.name;

    default:
      return "unknown";
  }
}

/**
 * Render all TypeScript types: nested definitions + root
 */
export function renderAllTypes(
  rootName: string,
  rootType: TsType,
  registry: TypeRegistry
): string {
  let out = "";

  // Render nested named types first
  for (const [name, t] of registry.definitions.entries()) {
    out += `interface ${name} ${renderType(t)}\n\n`;
  }

  // Render root
  if (rootType.kind === "object") {
    out += `interface ${rootName} ${renderType(rootType)}`;
  } else {
    out += `type ${rootName} = ${renderType(rootType)};`;
  }

  return out.trim();
}
