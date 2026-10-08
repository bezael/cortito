export const CODE_LENGTH = 6;

// El código sale del hash de la URL: así no hace falta consultar la base de datos.
export function generateCode(url: string): string {
  return Bun.hash(url).toString(36).padStart(CODE_LENGTH, "0").slice(0, CODE_LENGTH);
}
