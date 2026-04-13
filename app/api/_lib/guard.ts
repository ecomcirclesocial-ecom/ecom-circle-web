// Validaciones de seguridad compartidas para los API routes

export const VALID_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
export type ValidMediaType = (typeof VALID_MEDIA_TYPES)[number];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateMediaType(mediaType: unknown): mediaType is ValidMediaType {
  return VALID_MEDIA_TYPES.includes(mediaType as ValidMediaType);
}

export function sanitizeError(err: unknown): string {
  if (process.env.NODE_ENV === "development" && err instanceof Error) return err.message;
  return "Error interno del servidor";
}

export function checkImageSize(bytes: number): boolean {
  return bytes <= MAX_IMAGE_BYTES;
}
