// Utilidades de data com segurança para viradas de mês, ano bissexto e fuso horário.
// Estratégia: trabalhar com datas de calendário locais (YYYY-MM-DD) ao meio-dia
// para evitar deslocamentos de fuso; diferenças em dias civis.

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(now = new Date()): string {
  return toISODate(now);
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Dias civis entre aISO e bISO (b - a). */
export function daysBetween(aISO: string, bISO: string): number {
  const a = parseISODate(aISO);
  const b = parseISODate(bISO);
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86_400_000);
}

export function daysTogether(startISO: string, now = new Date()): number {
  const diff = daysBetween(startISO, toISODate(now));
  return diff < 0 ? 0 : diff;
}

export interface AnniversaryInfo {
  dateISO: string;
  years: number;
  daysLeft: number;
}

/** Próximo aniversário de relacionamento (mesmo mês/dia do início). */
export function nextAnniversary(startISO: string, now = new Date()): AnniversaryInfo {
  const start = parseISODate(startISO);
  const sm = start.getMonth();
  const sd = start.getDate();
  let year = now.getFullYear();
  // Trata 29/02 em anos não bissextos -> 28/02
  const candidate = (y: number): Date => {
    if (sm === 1 && sd === 29 && !isLeapYear(y)) return new Date(y, 1, 28, 12);
    return new Date(y, sm, sd, 12);
  };
  let next = candidate(year);
  const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (next.getTime() < todayNoon.getTime()) {
    year += 1;
    next = candidate(year);
  }
  const years = year - start.getFullYear();
  return {
    dateISO: toISODate(next),
    years,
    daysLeft: daysBetween(toISODate(now), toISODate(next)),
  };
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  passed: boolean;
}

/** Contagem regressiva até um ISO datetime ou YYYY-MM-DD. */
export function countdown(targetISO: string, now = new Date()): Countdown {
  const target =
    targetISO.length <= 10 ? parseISODate(targetISO) : new Date(targetISO);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, passed: true };
  const totalMin = Math.floor(diffMs / 60_000);
  return {
    days: Math.floor(totalMin / 1440),
    hours: Math.floor((totalMin % 1440) / 60),
    minutes: totalMin % 60,
    passed: false,
  };
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatDateTimeBR(ts: number): string {
  const d = new Date(ts);
  const date = toISODate(d);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatDateBR(date)} ${hh}:${mm}`;
}

export function formatTimeBR(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Grade do mês: 6 semanas x 7 dias (ou null fora do mês). Segunda = início. */
export function monthGrid(year: number, monthIndex: number): (string | null)[][] {
  const first = new Date(year, monthIndex, 1);
  // 0=domingo..6=sábado -> deslocamento p/ segunda
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const m = String(monthIndex + 1).padStart(2, '0');
    cells.push(`${year}-${m}-${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let w = 0; w < cells.length; w += 7) weeks.push(cells.slice(w, w + 7));
  return weeks;
}

export function monthLabelPT(year: number, monthIndex: number): string {
  const names = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  return `${names[monthIndex]} de ${year}`;
}
