// Love Connect Ultimate — tipos centrais (persistência local, escopo por casal)
export interface User {
  id: string;
  name: string;
  email: string;
  passHash: string;
  salt: string;
  photo?: string;
  createdAt: number;
}

export interface Couple {
  id: string;
  code: string;
  memberIds: string[];
  nameA: string;
  nameB: string;
  photoA?: string;
  photoB?: string;
  startDate: string; // YYYY-MM-DD
  title: string;
  messageOfDay?: string;
  accent?: string;
  createdAt: number;
}

export type MessageStatus = 'sent' | 'failed';

export interface ChatMessage {
  id: string;
  coupleId: string;
  authorId: string;
  text: string;
  image?: string;
  reactions: Record<string, string[]>;
  replyTo?: string;
  status: MessageStatus;
  clientKey: string;
  createdAt: number;
}

export interface Memory {
  id: string;
  coupleId: string;
  title: string;
  caption: string;
  date: string; // YYYY-MM-DD
  image: string; // dataURL (vazio = sem foto)
  album: string;
  favorite: boolean;
  createdAt: number;
}

export type EventCategory =
  | 'encontro'
  | 'viagem'
  | 'aniversario'
  | 'especial'
  | 'lembrete'
  | 'outro';

export interface CalEvent {
  id: string;
  coupleId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  category: EventCategory;
  notes?: string;
  reminderDays: number;
  createdAt: number;
}

export interface WishItem {
  id: string;
  coupleId: string;
  title: string;
  category: string;
  priority: 1 | 2 | 3;
  targetDate?: string;
  done: boolean;
  createdAt: number;
}

export type MovieStatus = 'quero-ver' | 'assistindo' | 'assistido';

export interface MovieItem {
  id: string;
  coupleId: string;
  title: string;
  kind: 'filme' | 'serie';
  status: MovieStatus;
  genre: string;
  ratingA?: number;
  ratingB?: number;
  comment?: string;
  createdAt: number;
}

export interface DiaryEntry {
  id: string;
  coupleId: string;
  authorId: string;
  title: string;
  body: string;
  date: string;
  photo?: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type LetterStatus = 'rascunho' | 'programada' | 'entregue';

export interface Letter {
  id: string;
  coupleId: string;
  authorId: string;
  title: string;
  body: string;
  cover: string;
  status: LetterStatus;
  deliverAt?: string; // ISO datetime
  createdAt: number;
}

export interface MoodEntry {
  id: string;
  coupleId: string;
  authorId: string;
  mood: string;
  note?: string;
  priv: boolean;
  createdAt: number;
}

export interface Track {
  id: string;
  coupleId: string;
  addedBy: string;
  title: string;
  artist: string;
  url?: string;
  memoryTitle?: string;
  favorite: boolean;
  createdAt: number;
}

export type ExpenseSplit = 'equal' | 'mine';

export interface Expense {
  id: string;
  coupleId: string;
  paidById: string;
  amountCents: number;
  category: string;
  note?: string;
  date: string; // YYYY-MM-DD
  split: ExpenseSplit;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  coupleId: string;
  kind: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

export interface WheelOption {
  id: string;
  label: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  game: string;
  question: string;
  choices?: string[];
  answer?: string;
}
