// [CHANGE NOTE | V1 File Uploads] Add filename sanitization and storage path helpers
// Rules: ASCII lowercase [a-z0-9._-]; path: user/<uid>/mem_<memoryId>/<timestamp>_<safe_name>

/** Sanitize a filename to ASCII lowercase [a-z0-9._-] and trim to a safe length. */
export function sanitizeFileName(input: string, options?: { maxLength?: number }): string {
  const maxLength = options?.maxLength ?? 120; // keep reasonably short for URLs
  // Normalize unicode, strip diacritics, to ASCII-ish
  const normalized = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove combining marks
    .replace(/[^\x00-\x7F]+/g, ''); // drop non-ASCII

  // Lowercase and keep allowed chars only
  const safe = normalized
    .toLowerCase()
    .replace(/\s+/g, '_') // spaces to underscore
    .replace(/[^a-z0-9._-]/g, '-') // replace disallowed with '-'
    .replace(/-{2,}/g, '-') // collapse dashes
    .replace(/^\.+/, '') // no leading dots
    .replace(/\.+$/, ''); // no trailing dots

  // Ensure non-empty; fall back if needed
  const base = safe || 'file';

  // Enforce max length (preserve extension if present)
  const lastDot = base.lastIndexOf('.');
  if (lastDot > 0 && lastDot < base.length - 1) {
    const name = base.slice(0, lastDot);
    const ext = base.slice(lastDot);
    const nameBudget = Math.max(1, maxLength - ext.length);
    return (name.length > nameBudget ? name.slice(0, nameBudget) : name) + ext;
  }
  return base.slice(0, maxLength);
}

/** Build a storage path per convention: user/<uid>/mem_<memoryId>/<timestamp>_<safe_name> */
export function buildStoragePath(args: {
  uid: string;
  memoryId: string | number;
  fileName: string;
  now?: Date; // for testing
}): string {
  const { uid, memoryId, fileName } = args;
  const ts = (args.now ?? new Date())
    .toISOString()
    .replace(/[-:TZ]/g, '')
    .slice(0, 14);
  const safe = sanitizeFileName(fileName);
  return `user/${uid}/mem_${String(memoryId)}/${ts}_${safe}`;
}

/** Basic unit tests (lightweight) for local dev; can be removed or replaced by jest/vitest later */
export function __test__filename() {
  const s1 = sanitizeFileName('Résumé 2025 Final!!.pdf');
  if (!s1.endsWith('.pdf') || /[^a-z0-9._-]/.test(s1)) throw new Error('sanitize failed');
  const path = buildStoragePath({
    uid: 'abc123',
    memoryId: 42,
    fileName: 'A B C.png',
    now: new Date('2025-09-22T10:11:12Z'),
  });
  if (!path.startsWith('user/abc123/mem_42/20250922')) throw new Error('path date failed');
  if (!path.endsWith('_a_b_c.png')) throw new Error('path filename failed');
}
