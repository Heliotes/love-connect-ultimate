import { describe, it, expect } from 'vitest';
import {
  scoreQuiz, compatibilityMessage, drawWheel, filterWheel,
  expenseSummary, letterEffectiveStatus, movieProgress, wishProgress,
} from './logic';
import type { Expense, Letter } from '../types';

describe('regras de negócio', () => {
  it('pontua quiz', () => {
    const r = scoreQuiz({ a: 'x', b: 'y' }, { a: 'x', b: 'z' });
    expect(r.hits).toBe(1);
    expect(r.percent).toBe(50);
  });
  it('mensagem de compatibilidade por faixa', () => {
    expect(compatibilityMessage(95)).toContain('lendária');
    expect(compatibilityMessage(10)).toContain('encontro');
  });
  it('roleta: sorteio determinístico e vazio', () => {
    expect(drawWheel([])).toBeNull();
    const opts = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(drawWheel(opts, () => 0)).toEqual({ id: 'a' });
    expect(drawWheel(opts, () => 0.999)).toEqual({ id: 'c' });
    expect(filterWheel(
      [{ id: '1', label: 'x', category: 'A' }, { id: '2', label: 'y', category: 'B' }], 'A',
    )).toHaveLength(1);
  });
  it('despesas: meio a meio gera acerto correto', () => {
    const ex: Expense[] = [
      { id: '1', coupleId: 'c', paidById: 'A', amountCents: 10000, category: 'Lazer', date: '2025-01-01', split: 'equal', createdAt: 1 },
      { id: '2', coupleId: 'c', paidById: 'B', amountCents: 4000, category: 'Lazer', date: '2025-01-02', split: 'equal', createdAt: 2 },
    ];
    const s = expenseSummary(ex);
    expect(s.totalCents).toBe(14000);
    // cada um deveria ter gasto 7000; A pagou 10000 (+3000), B pagou 4000 (-3000)
    expect(s.balanceCents.A).toBe(3000);
    expect(s.balanceCents.B).toBe(-3000);
  });
  it('carta programada vira entregue após a data', () => {
    const future: Letter = { id: '1', coupleId: 'c', authorId: 'a', title: 't', body: 'b', cover: '💌', status: 'programada', deliverAt: new Date(Date.now() + 86_400_000).toISOString(), createdAt: 1 };
    const past: Letter = { ...future, deliverAt: new Date(Date.now() - 1000).toISOString() };
    expect(letterEffectiveStatus(future)).toBe('programada');
    expect(letterEffectiveStatus(past)).toBe('entregue');
    expect(letterEffectiveStatus({ ...future, status: 'rascunho' })).toBe('rascunho');
  });
  it('progresso de filmes e desejos', () => {
    expect(movieProgress([]).percent).toBe(0);
    expect(wishProgress([{ done: true }, { done: false }] as { done: boolean }[])).toEqual({ total: 2, done: 1, percent: 50 });
  });
});
