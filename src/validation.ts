export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateUrl(input: unknown): ValidationResult {
  if (typeof input !== "string" || !URL.canParse(input.trim())) {
    return { ok: false, error: "La URL no es válida." };
  }
  return { ok: true, value: new URL(input.trim()).href };
}
