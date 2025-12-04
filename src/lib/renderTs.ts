import type { TsType } from "./types";

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

      // Wrap only if the element is a union (never for objects)
      if (t.element.kind === "union") {
        return `(${el})[]`;
      }

      return `${el}[]`;
    }

    case "union": {
      // Join each union member (each rendered recursively)
      return t.types.map((m) => renderType(m, indent)).join(" | ");
    }

    case "object": {
      // Pretty-print object with newlines and indentation
      const entries = Object.entries(t.fields);
      if (entries.length === 0) return "{}";

      const inner = entries
        .map(([k, v]) => {
          const val = renderType(v, indent + 1);
          return `${pad}  ${k}: ${val};`;
        })
        .join("\n");

      return `{\n${inner}\n${pad}}`;
    }

    default:
      return "unknown";
  }
}

/**
 * Render top-level TypeScript output.
 * If the top-level type is an object → emit `interface <name> { ... }`
 * otherwise emit `type <name> = <type-expression>;`
 */
export function renderTs(name: string, t: TsType): string {
  if (t.kind === "object") {
    return `interface ${name} ${renderType(t, 0)}`;
  }

  // for non-object top-levels, use a type alias
  return `type ${name} = ${renderType(t, 0)};`;
}
