export type TsType =
  | { kind: "string" }
  | { kind: "number" }
  | { kind: "boolean" }
  | { kind: "null" }
  | { kind: "unknown" }

  // array of another type
  | { kind: "array"; element: TsType }

  // inline object (fields)
  | { kind: "object"; fields: Record<string, TsType> }

  // union types
  | { kind: "union"; types: TsType[] }

  // named reference to another type
  | { kind: "ref"; name: string };
