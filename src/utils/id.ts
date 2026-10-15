// Geradores de id / código de convite (sem dependências externas)
export function genId(prefix = 'id'): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function inviteCode(length = 6): string {
  let out = '';
  const buf = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(buf);
    for (let i = 0; i < length; i++) out += CODE_ALPHABET[buf[i] % CODE_ALPHABET.length];
  } else {
    for (let i = 0; i < length; i++)
      out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}
