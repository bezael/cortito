export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = ["http:", "https:"];

export function validateUrl(input: unknown): ValidationResult {
  if (typeof input !== "string" || input.trim() === "") {
    return { ok: false, error: "Falta la URL." };
  }

  const value = input.trim();
  if (value.length > MAX_URL_LENGTH) {
    return { ok: false, error: `La URL no puede tener más de ${MAX_URL_LENGTH} caracteres.` };
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, error: "La URL no es válida." };
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { ok: false, error: "Solo se aceptan URLs http o https." };
  }

  return { ok: true, value: parsed.href };
}
