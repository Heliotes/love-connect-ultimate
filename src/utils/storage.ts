// Wrapper tipado do localStorage com parse seguro (nunca quebra o app).
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export function exportAll(keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      out[k] = raw ? JSON.parse(raw) : null;
    } catch {
      out[k] = null;
    }
  }
  return out;
}
