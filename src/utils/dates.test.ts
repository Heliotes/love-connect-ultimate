import { describe, it, expect } from 'vitest';
import {
  daysBetween, daysTogether, nextAnniversary, countdown, monthGrid,
  isLeapYear, parseISODate, toISODate, formatDateBR,
} from './dates';

describe('dates', () => {
  it('calcula dias entre datas (virada de mês)', () => {
    expect(daysBetween('2024-01-30', '2024-02-02')).toBe(3);
  });
  it('atravessa ano bissexto (28/02 -> 01/03 em 2024 = 2 dias)', () => {
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
  });
  it('ano não bissexto (28/02 -> 01/03 em 2023 = 1 dia)', () => {
    expect(daysBetween('2023-02-28', '2023-03-01')).toBe(1);
  });
  it('isLeapYear cobre século', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
  });
  it('daysTogether nunca é negativo', () => {
    expect(daysTogether('2030-01-01', new Date(2025, 0, 1))).toBe(0);
    expect(daysTogether('2025-01-01', new Date(2025, 1, 1))).toBe(31);
  });
  it('próximo aniversário após a data', () => {
    const ann = nextAnniversary('2020-06-15', new Date(2025, 5, 16, 12));
    expect(ann.dateISO).toBe('2026-06-15');
    expect(ann.years).toBe(6);
  });
  it('aniversário de 29/02 cai em 28/02 em ano comum', () => {
    const ann = nextAnniversary('2020-02-29', new Date(2025, 0, 10, 12));
    expect(ann.dateISO).toBe('2025-02-28');
  });
  it('countdown futuro e passado', () => {
    const now = new Date(2025, 0, 1, 12, 0);
    const cd = countdown('2025-01-03', now);
    expect(cd.passed).toBe(false);
    expect(cd.days).toBeGreaterThanOrEqual(1);
    expect(countdown('2024-12-31', now).passed).toBe(true);
  });
  it('grade do mês tem semanas completas', () => {
    const grid = monthGrid(2024, 1); // fevereiro 2024 (bissexto)
    expect(grid.length).toBeGreaterThanOrEqual(4);
    expect(grid.every((w) => w.length === 7)).toBe(true);
    const days = grid.flat().filter(Boolean);
    expect(days).toHaveLength(29);
  });
  it('formatação BR', () => {
    expect(formatDateBR('2025-03-09')).toBe('09/03/2025');
    expect(toISODate(parseISODate('2025-03-09'))).toBe('2025-03-09');
  });
});
