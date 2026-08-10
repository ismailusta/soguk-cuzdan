/** Product stock / support code: SN-XXXXXXXXX (9 chars). */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const SN_RE = /^SN-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{9}$/;

export function isValidProductSn(value: string): boolean {
  return SN_RE.test(String(value || "").trim().toUpperCase());
}

export function normalizeProductSn(value: string): string {
  return String(value || "").trim().toUpperCase();
}

export function generateProductSn(): string {
  const bytes = new Uint8Array(9);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 9; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = "SN-";
  for (let i = 0; i < 9; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}
