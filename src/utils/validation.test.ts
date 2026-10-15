import { describe, it, expect } from 'vitest';
import { isEmail, passwordValid, toCents, formatBRL, isURL, clampRating } from './validation';

describe('validation', () => {
  it('e-mail', () => {
    expect(isEmail('amor@exemplo.com')).toBe(true);
    expect(isEmail('errado@')).toBe(false);
    expect(isEmail('sem-arroba.com')).toBe(false);
  });
  it('senha mínima', () => {
    expect(passwordValid('123456')).toBe(true);
    expect(passwordValid('123')).toBe(false);
  });
  it('converte valores em centavos', () => {
    expect(toCents('59,90')).toBe(5990);
    expect(toCents('10')).toBe(1000);
    expect(toCents('abc')).toBeNull();
    expect(toCents('-5')).toBeNull();
  });
  it('formata BRL', () => {
    expect(formatBRL(5990)).toContain('59,90');
  });
  it('url opcional', () => {
    expect(isURL('')).toBe(true);
    expect(isURL('https://open.spotify.com/x')).toBe(true);
    expect(isURL('nota-url')).toBe(false);
  });
  it('nota entre 0 e 5', () => {
    expect(clampRating(9)).toBe(5);
    expect(clampRating(-2)).toBe(0);
    expect(clampRating(4)).toBe(4);
  });
});
