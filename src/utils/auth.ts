// Hash de senha para a versão local (DEMO — ver aviso no README).
// Usa SHA-256 com salt. NÃO é autenticação segura de produção:
// sem backend, qualquer pessoa com acesso ao dispositivo pode ler o
// localStorage. Para produção, use Supabase Auth / Firebase Auth.
export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}::${password}`);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback determinístico (apenas ambientes sem WebCrypto)
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const s = `${salt}::${password}`;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `fb${(4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)}`;
}

export function makeSalt(): string {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
