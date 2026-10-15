import { describe, it, expect, beforeEach, vi } from 'vitest';
import { load, save, remove } from './storage';
import { genId, inviteCode } from './id';

// Polyfill mínimo de localStorage (ambiente node, sem jsdom)
function installStorageMock() {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
  });
  return store;
}

describe('storage + id', () => {
  beforeEach(() => {
    installStorageMock();
    localStorage.clear();
  });
  it('load com fallback em JSON inválido', () => {
    localStorage.setItem('x', '{invalido');
    expect(load('x', { a: 1 })).toEqual({ a: 1 });
  });
  it('save/load roundtrip e remove', () => {
    expect(save('k', [1, 2])).toBe(true);
    expect(load('k', [])).toEqual([1, 2]);
    remove('k');
    expect(load('k', [])).toEqual([]);
  });
  it('ids únicos e código de convite válido', () => {
    expect(genId('a')).not.toBe(genId('a'));
    const code = inviteCode();
    expect(code).toMatch(/^[A-Z2-9]{6}$/);
  });
});
