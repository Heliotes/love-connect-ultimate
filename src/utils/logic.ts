// Regras de negócio puras (testáveis, sem React).
import type { Expense, Letter, MovieItem, WheelOption } from '../types';

export function scoreQuiz(answers: Record<string, string>, correct: Record<string, string>): {
  total: number;
  hits: number;
  percent: number;
} {
  const keys = Object.keys(correct);
  let hits = 0;
  for (const k of keys) if (answers[k] === correct[k]) hits++;
  return { total: keys.length, hits, percent: keys.length ? Math.round((hits / keys.length) * 100) : 0 };
}

export function compatibilityMessage(percent: number): string {
  if (percent >= 90) return 'Sintonia lendária! 💖';
  if (percent >= 70) return 'Conexão fortíssima! 💕';
  if (percent >= 50) return 'Vocês se conhecem bem! 😊';
  if (percent >= 30) return 'Bom começo — continuem conversando! 💬';
  return 'Hora de um encontro e muitas perguntas! 🌹';
}

/** Sorteio real da roleta. `rand` injetável para testes. */
export function drawWheel<T extends { id: string }>(options: T[], rand = Math.random): T | null {
  if (options.length === 0) return null;
  const i = Math.floor(rand() * options.length);
  return options[Math.min(i, options.length - 1)];
}

export function filterWheel(options: WheelOption[], category: string): WheelOption[] {
  if (category === 'Todas') return options;
  return options.filter((o) => o.category === category);
}

export interface ExpenseSummary {
  totalCents: number;
  paidBy: Record<string, number>;
  balanceCents: Record<string, number>; // positivo = tem a receber
}

export function expenseSummary(expenses: Expense[]): ExpenseSummary {
  let total = 0;
  const paidBy: Record<string, number> = {};
  const balance: Record<string, number> = {};
  const members = new Set<string>();
  for (const e of expenses) {
    members.add(e.paidById);
    total += e.amountCents;
    paidBy[e.paidById] = (paidBy[e.paidById] ?? 0) + e.amountCents;
  }
  const ids = [...members];
  // Para cada despesa 'equal', divide entre os 2 membros conhecidos (ou só o pagador se só houver 1).
  const share: Record<string, number> = {};
  for (const e of expenses) {
    if (e.split === 'mine') {
      share[e.paidById] = (share[e.paidById] ?? 0) + e.amountCents;
    } else {
      const others = ids.filter((id) => id !== e.paidById);
      if (others.length === 0) {
        share[e.paidById] = (share[e.paidById] ?? 0) + e.amountCents;
      } else {
        const per = Math.floor(e.amountCents / (others.length + 1));
        const rest = e.amountCents - per * (others.length + 1);
        share[e.paidById] = (share[e.paidById] ?? 0) + per + rest;
        for (const o of others) share[o] = (share[o] ?? 0) + per;
      }
    }
  }
  for (const id of ids) balance[id] = (paidBy[id] ?? 0) - (share[id] ?? 0);
  return { totalCents: total, paidBy, balanceCents: balance };
}

export function letterEffectiveStatus(letter: Letter, now = Date.now()): Letter['status'] {
  if (letter.status === 'rascunho') return 'rascunho';
  if (letter.status === 'programada' && letter.deliverAt) {
    return new Date(letter.deliverAt).getTime() <= now ? 'entregue' : 'programada';
  }
  return letter.status;
}

export function movieProgress(movies: MovieItem[]): { total: number; done: number; percent: number } {
  const total = movies.length;
  const done = movies.filter((m) => m.status === 'assistido').length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function wishProgress<T extends { done: boolean }>(items: T[]): {
  total: number;
  done: number;
  percent: number;
} {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}
