export type TsType =
  | { kind: "string" }
  | { kind: "number" }
  | { kind: "boolean" }
  | { kind: "null" }
  | { kind: "unknown" }
  | { kind: "array"; element: TsType }
  | { kind: "object"; fields: Record<string, TsType> }
  | { kind: "union"; types: TsType[] };
