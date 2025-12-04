export type ParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

export function parseJson(input: string): ParseResult {
  if (input.trim() === "") {
    return { ok: true, value: null }; // Empty until user types
  }

  try {
    const value = JSON.parse(input);
    return { ok: true, value };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    return { ok: false, error: message };
  }
}
