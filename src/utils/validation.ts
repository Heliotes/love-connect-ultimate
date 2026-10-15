// Validações de entrada (cliente). O backend local aplica as mesmas regras.
export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function passwordValid(v: string): boolean {
  return v.length >= 6;
}

export function required(v: string): boolean {
  return v.trim().length > 0;
}

export function isURL(v: string): boolean {
  if (!v.trim()) return true; // opcional
  try {
    const u = new URL(v.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Converte "12,50" / "12.50" em centavos. Retorna null se inválido. */
export function toCents(input: string): number | null {
  const norm = input.trim().replace(/\./g, '').replace(',', '.');
  // remove separador de milhar apenas se houver parte decimal
  const cleaned = norm.includes('.') ? norm : norm.replace(/\s/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000_000) return null;
  return Math.round(n * 100);
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function clampRating(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, Math.round(n)));
}
