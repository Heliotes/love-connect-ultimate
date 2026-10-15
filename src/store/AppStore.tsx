// Store global: autenticação local + dados por casal, persistidos em localStorage.
// Escopo: toda escrita exige usuário logado + casal ativo; leituras filtram por coupleId.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AppNotification, CalEvent, ChatMessage, Couple, DiaryEntry, Expense,
  Letter, Memory, MoodEntry, MovieItem, Track, User, WheelOption, WishItem,
} from '../types';
import { genId, inviteCode } from '../utils/id';
import { hashPassword, makeSalt } from '../utils/auth';
import { load, save, exportAll } from '../utils/storage';

const K = {
  users: 'lcu_users',
  session: 'lcu_session',
  couples: 'lcu_couples',
  messages: 'lcu_messages',
  memories: 'lcu_memories',
  events: 'lcu_events',
  wishlist: 'lcu_wishlist',
  movies: 'lcu_movies',
  diary: 'lcu_diary',
  letters: 'lcu_letters',
  moods: 'lcu_moods',
  tracks: 'lcu_tracks',
  expenses: 'lcu_expenses',
  notifications: 'lcu_notifications',
  wheel: 'lcu_wheel',
  prefs: 'lcu_prefs',
  resets: 'lcu_resets',
} as const;

export const ALL_KEYS = Object.values(K);

export interface Prefs {
  theme: 'light' | 'dark' | 'auto';
  accent: string;
  homeCards: string[];
}

const DEFAULT_PREFS: Prefs = {
  theme: 'auto',
  accent: '#c2255c',
  homeCards: ['counter', 'events', 'memories', 'question', 'shortcuts'],
};

interface ResetToken { email: string; token: string; expires: number; }

function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => load<T>(key, initial));
  useEffect(() => { save(key, value); }, [key, value]);
  return [value, setValue] as const;
}

export interface RegisterInput { name: string; email: string; password: string; }

export interface Store {
  user: User | null;
  couple: Couple | null;
  users: User[];
  couples: Couple[];
  messages: ChatMessage[];
  memories: Memory[];
  events: CalEvent[];
  wishlist: WishItem[];
  movies: MovieItem[];
  diary: DiaryEntry[];
  letters: Letter[];
  moods: MoodEntry[];
  tracks: Track[];
  expenses: Expense[];
  notifications: AppNotification[];
  wheel: WheelOption[];
  prefs: Prefs;
  unreadCount: number;
  // auth
  register: (input: RegisterInput) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  requestReset: (email: string) => string | null;
  confirmReset: (token: string, newPassword: string) => Promise<string | null>;
  updateProfile: (patch: Partial<Pick<User, 'name' | 'photo'>>) => void;
  deleteAccount: () => void;
  // casal
  createCouple: (data: { title: string; nameA: string; nameB: string; startDate: string }) => string | null;
  joinCouple: (code: string) => string | null;
  updateCouple: (patch: Partial<Couple>) => void;
  leaveCouple: () => void;
  // chat
  sendMessage: (text: string, image?: string, replyTo?: string, clientKey?: string) => void;
  toggleReaction: (msgId: string, emoji: string) => void;
  deleteMessage: (msgId: string) => void;
  // coleções genéricas
  saveMemory: (m: Omit<Memory, 'id' | 'coupleId' | 'createdAt'>, id?: string) => void;
  deleteMemory: (id: string) => void;
  saveEvent: (e: Omit<CalEvent, 'id' | 'coupleId' | 'createdAt'>, id?: string) => void;
  deleteEvent: (id: string) => void;
  saveWish: (w: Omit<WishItem, 'id' | 'coupleId' | 'createdAt'>, id?: string) => void;
  deleteWish: (id: string) => void;
  saveMovie: (m: Omit<MovieItem, 'id' | 'coupleId' | 'createdAt'>, id?: string) => void;
  deleteMovie: (id: string) => void;
  saveDiary: (d: Omit<DiaryEntry, 'id' | 'coupleId' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  deleteDiary: (id: string) => void;
  saveLetter: (l: Omit<Letter, 'id' | 'coupleId' | 'createdAt'>, id?: string) => void;
  deleteLetter: (id: string) => void;
  saveMood: (m: Omit<MoodEntry, 'id' | 'coupleId' | 'createdAt'>) => void;
  deleteMood: (id: string) => void;
  saveTrack: (t: Omit<Track, 'id' | 'coupleId' | 'createdAt'>, id?: string) => void;
  deleteTrack: (id: string) => void;
  saveExpense: (e: Omit<Expense, 'id' | 'coupleId' | 'createdAt'>, id?: string) => void;
  deleteExpense: (id: string) => void;
  pushNotification: (kind: string, title: string, body: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  // roleta + prefs
  addWheel: (label: string, category: string) => void;
  deleteWheel: (id: string) => void;
  resetWheel: (defaults: { label: string; category: string }[]) => void;
  setPrefs: (patch: Partial<Prefs>) => void;
  exportData: () => string;
}

const Ctx = createContext<Store | null>(null);

export function coupleOf<T extends { coupleId: string }>(items: T[], coupleId: string | undefined): T[] {
  if (!coupleId) return [];
  return items.filter((i) => i.coupleId === coupleId);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = usePersistent<User[]>(K.users, []);
  const [sessionId, setSessionId] = usePersistent<string | null>(K.session, null);
  const [couples, setCouples] = usePersistent<Couple[]>(K.couples, []);
  const [allMessages, setAllMessages] = usePersistent<ChatMessage[]>(K.messages, []);
  const [allMemories, setAllMemories] = usePersistent<Memory[]>(K.memories, []);
  const [allEvents, setAllEvents] = usePersistent<CalEvent[]>(K.events, []);
  const [allWishlist, setAllWishlist] = usePersistent<WishItem[]>(K.wishlist, []);
  const [allMovies, setAllMovies] = usePersistent<MovieItem[]>(K.movies, []);
  const [allDiary, setAllDiary] = usePersistent<DiaryEntry[]>(K.diary, []);
  const [allLetters, setAllLetters] = usePersistent<Letter[]>(K.letters, []);
  const [allMoods, setAllMoods] = usePersistent<MoodEntry[]>(K.moods, []);
  const [allTracks, setAllTracks] = usePersistent<Track[]>(K.tracks, []);
  const [allExpenses, setAllExpenses] = usePersistent<Expense[]>(K.expenses, []);
  const [allNotifications, setAllNotifications] = usePersistent<AppNotification[]>(K.notifications, []);
  const [wheel, setWheel] = usePersistent<WheelOption[]>(K.wheel, []);
  const [prefs, setPrefsState] = usePersistent<Prefs>(K.prefs, DEFAULT_PREFS);
  const [resets, setResets] = usePersistent<ResetToken[]>(K.resets, []);

  const user = useMemo(() => users.find((u) => u.id === sessionId) ?? null, [users, sessionId]);
  const couple = useMemo(() => {
    if (!user) return null;
    return couples.find((c) => c.memberIds.includes(user.id)) ?? null;
  }, [couples, user]);

  const cid = couple?.id;
  const messages = useMemo(() => coupleOf(allMessages, cid).sort((a, b) => a.createdAt - b.createdAt), [allMessages, cid]);
  const memories = useMemo(() => coupleOf(allMemories, cid).sort((a, b) => b.createdAt - a.createdAt), [allMemories, cid]);
  const events = useMemo(() => coupleOf(allEvents, cid).sort((a, b) => a.date.localeCompare(b.date)), [allEvents, cid]);
  const wishlist = useMemo(() => coupleOf(allWishlist, cid), [allWishlist, cid]);
  const movies = useMemo(() => coupleOf(allMovies, cid), [allMovies, cid]);
  const diary = useMemo(() => coupleOf(allDiary, cid).sort((a, b) => b.date.localeCompare(a.date)), [allDiary, cid]);
  const letters = useMemo(() => coupleOf(allLetters, cid).sort((a, b) => b.createdAt - a.createdAt), [allLetters, cid]);
  const moods = useMemo(() => coupleOf(allMoods, cid).sort((a, b) => b.createdAt - a.createdAt), [allMoods, cid]);
  const tracks = useMemo(() => coupleOf(allTracks, cid), [allTracks, cid]);
  const expenses = useMemo(() => coupleOf(allExpenses, cid).sort((a, b) => b.date.localeCompare(a.date)), [allExpenses, cid]);
  const notifications = useMemo(
    () => coupleOf(allNotifications, cid).sort((a, b) => b.createdAt - a.createdAt),
    [allNotifications, cid],
  );
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Tema
  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: Prefs['theme']) => {
      if (t === 'auto') {
        root.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        root.dataset.theme = t;
      }
    };
    apply(prefs.theme);
    root.style.setProperty('--accent', prefs.accent);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = () => { if (prefs.theme === 'auto') apply('auto'); };
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [prefs.theme, prefs.accent]);

  const register = useCallback(async (input: RegisterInput): Promise<string | null> => {
    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) return 'Este e-mail já está cadastrado.';
    const salt = makeSalt();
    const passHash = await hashPassword(input.password, salt);
    const u: User = { id: genId('user'), name: input.name.trim(), email, passHash, salt, createdAt: Date.now() };
    setUsers((prev) => [...prev, u]);
    setSessionId(u.id);
    return null;
  }, [users, setUsers, setSessionId]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const norm = email.trim().toLowerCase();
    const u = load<User[]>(K.users, users).find((x) => x.email === norm);
    const list = u ? [u] : users.filter((x) => x.email === norm);
    const found = list[0];
    if (!found) return 'E-mail ou senha incorretos.';
    const h = await hashPassword(password, found.salt);
    if (h !== found.passHash) return 'E-mail ou senha incorretos.';
    setSessionId(found.id);
    return null;
  }, [users, setSessionId]);

  const logout = useCallback(() => setSessionId(null), [setSessionId]);

  const requestReset = useCallback((email: string): string | null => {
    const norm = email.trim().toLowerCase();
    if (!users.some((u) => u.email === norm)) return null; // não revela
    const token = inviteCode(6);
    setResets((prev) => [...prev.filter((r) => r.email !== norm), { email: norm, token, expires: Date.now() + 30 * 60_000 }]);
    return token;
  }, [users, setResets]);

  const confirmReset = useCallback(async (token: string, newPassword: string): Promise<string | null> => {
    const r = resets.find((x) => x.token === token.toUpperCase().trim() && x.expires > Date.now());
    if (!r) return 'Código inválido ou expirado.';
    const salt = makeSalt();
    const passHash = await hashPassword(newPassword, salt);
    setUsers((prev) => prev.map((u) => (u.email === r.email ? { ...u, salt, passHash } : u)));
    setResets((prev) => prev.filter((x) => x.token !== r.token));
    return null;
  }, [resets, setUsers, setResets]);

  const updateProfile = useCallback((patch: Partial<Pick<User, 'name' | 'photo'>>) => {
    if (!user) return;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...patch } : u)));
  }, [user, setUsers]);

  const deleteAccount = useCallback(() => {
    if (!user) return;
    const uid = user.id;
    setUsers((prev) => prev.filter((u) => u.id !== uid));
    setCouples((prev) => prev.map((c) => ({ ...c, memberIds: c.memberIds.filter((id) => id !== uid) })).filter((c) => c.memberIds.length > 0));
    setSessionId(null);
  }, [user, setUsers, setCouples, setSessionId]);

  const createCouple = useCallback((data: { title: string; nameA: string; nameB: string; startDate: string }): string | null => {
    if (!user) return 'Entre na sua conta primeiro.';
    if (couples.some((c) => c.memberIds.includes(user.id))) return 'Você já participa de um espaço. Saia do atual para criar outro.';
    const c: Couple = {
      id: genId('couple'), code: inviteCode(6), memberIds: [user.id],
      title: data.title.trim() || 'Nosso cantinho', nameA: data.nameA.trim() || user.name,
      nameB: data.nameB.trim() || 'Amor', startDate: data.startDate, createdAt: Date.now(),
    };
    setCouples((prev) => [...prev, c]);
    return null;
  }, [user, couples, setCouples]);

  const joinCouple = useCallback((code: string): string | null => {
    if (!user) return 'Entre na sua conta primeiro.';
    if (couples.some((c) => c.memberIds.includes(user.id))) return 'Você já participa de um espaço.';
    const norm = code.trim().toUpperCase();
    const target = couples.find((c) => c.code === norm);
    if (!target) return 'Código não encontrado. Confira com seu amor.';
    if (target.memberIds.length >= 2) return 'Este espaço já tem 2 pessoas.';
    setCouples((prev) => prev.map((c) => (c.id === target.id ? { ...c, memberIds: [...c.memberIds, user.id] } : c)));
    return null;
  }, [user, couples, setCouples]);

  const updateCouple = useCallback((patch: Partial<Couple>) => {
    if (!cid) return;
    setCouples((prev) => prev.map((c) => (c.id === cid ? { ...c, ...patch } : c)));
  }, [cid, setCouples]);

  const leaveCouple = useCallback(() => {
    if (!user || !cid) return;
    const uid = user.id;
    setCouples((prev) => prev
      .map((c) => (c.id === cid ? { ...c, memberIds: c.memberIds.filter((id) => id !== uid) } : c))
      .filter((c) => c.memberIds.length > 0));
  }, [user, cid, setCouples]);

  const sendMessage = useCallback((text: string, image?: string, replyTo?: string, clientKey?: string) => {
    if (!user || !cid) return;
    const key = clientKey ?? genId('ck');
    let duplicate = false;
    setAllMessages((prev) => {
      if (prev.some((m) => m.clientKey === key)) { duplicate = true; return prev; }
      const msg: ChatMessage = {
        id: genId('msg'), coupleId: cid, authorId: user.id, text: text.trim(),
        image, reactions: {}, replyTo, status: 'sent', clientKey: key, createdAt: Date.now(),
      };
      return [...prev, msg];
    });
    void duplicate;
  }, [user, cid, setAllMessages]);

  const toggleReaction = useCallback((msgId: string, emoji: string) => {
    if (!user) return;
    const uid = user.id;
    setAllMessages((prev) => prev.map((m) => {
      if (m.id !== msgId) return m;
      const list = m.reactions[emoji] ?? [];
      const has = list.includes(uid);
      return { ...m, reactions: { ...m.reactions, [emoji]: has ? list.filter((id) => id !== uid) : [...list, uid] } };
    }));
  }, [user, setAllMessages]);

  const deleteMessage = useCallback((msgId: string) => {
    if (!user) return;
    const uid = user.id;
    setAllMessages((prev) => prev.filter((m) => !(m.id === msgId && m.authorId === uid)));
  }, [user, setAllMessages]);

  const guard = cid == null;

  const saveMemory = useCallback((m: Omit<Memory, 'id' | 'coupleId' | 'createdAt'>, id?: string) => {
    if (!cid || !user) return;
    if (id) {
      setAllMemories((prev) => prev.map((x) => (x.id === id && x.coupleId === cid ? { ...x, ...m } : x)));
    } else {
      const mem: Memory = { ...m, id: genId('mem'), coupleId: cid, createdAt: Date.now() };
      setAllMemories((prev) => [...prev, mem]);
      const n: AppNotification = { id: genId('notif'), coupleId: cid, kind: 'memoria', title: 'Nova memória 💖', body: mem.title, read: false, createdAt: Date.now() };
      setAllNotifications((prev) => [...prev, n]);
    }
  }, [cid, user, setAllMemories, setAllNotifications]);

  const deleteMemory = useCallback((id: string) => {
    setAllMemories((prev) => prev.filter((x) => !(x.id === id && x.coupleId === cid)));
  }, [cid, setAllMemories]);

  const saveEvent = useCallback((e: Omit<CalEvent, 'id' | 'coupleId' | 'createdAt'>, id?: string) => {
    if (!cid) return;
    if (id) setAllEvents((prev) => prev.map((x) => (x.id === id && x.coupleId === cid ? { ...x, ...e } : x)));
    else setAllEvents((prev) => [...prev, { ...e, id: genId('evt'), coupleId: cid, createdAt: Date.now() }]);
  }, [cid, setAllEvents]);

  const deleteEvent = useCallback((id: string) => {
    setAllEvents((prev) => prev.filter((x) => !(x.id === id && x.coupleId === cid)));
  }, [cid, setAllEvents]);

  const saveWish = useCallback((w: Omit<WishItem, 'id' | 'coupleId' | 'createdAt'>, id?: string) => {
    if (!cid) return;
    if (id) setAllWishlist((prev) => prev.map((x) => (x.id === id && x.coupleId === cid ? { ...x, ...w } : x)));
    else setAllWishlist((prev) => [...prev, { ...w, id: genId('wish'), coupleId: cid, createdAt: Date.now() }]);
  }, [cid, setAllWishlist]);

  const deleteWish = useCallback((id: string) => {
    setAllWishlist((prev) => prev.filter((x) => !(x.id === id && x.coupleId === cid)));
  }, [cid, setAllWishlist]);

  const saveMovie = useCallback((m: Omit<MovieItem, 'id' | 'coupleId' | 'createdAt'>, id?: string) => {
    if (!cid) return;
    if (id) setAllMovies((prev) => prev.map((x) => (x.id === id && x.coupleId === cid ? { ...x, ...m } : x)));
    else setAllMovies((prev) => [...prev, { ...m, id: genId('mov'), coupleId: cid, createdAt: Date.now() }]);
  }, [cid, setAllMovies]);

  const deleteMovie = useCallback((id: string) => {
    setAllMovies((prev) => prev.filter((x) => !(x.id === id && x.coupleId === cid)));
  }, [cid, setAllMovies]);

  const saveDiary = useCallback((d: Omit<DiaryEntry, 'id' | 'coupleId' | 'createdAt' | 'updatedAt'>, id?: string) => {
    if (!cid || !user) return;
    if (id) {
      setAllDiary((prev) => prev.map((x) => (x.id === id && x.coupleId === cid ? { ...x, ...d, updatedAt: Date.now() } : x)));
    } else {
      const now = Date.now();
      setAllDiary((prev) => [...prev, { ...d, id: genId('diary'), coupleId: cid, authorId: user.id, createdAt: now, updatedAt: now }]);
    }
  }, [cid, user, setAllDiary]);

  const deleteDiary = useCallback((id: string) => {
    setAllDiary((prev) => prev.filter((x) => !(x.id === id && x.coupleId === cid)));
  }, [cid, setAllDiary]);

  const saveLetter = useCallback((l: Omit<Letter, 'id' | 'coupleId' | 'createdAt'>, id?: string) => {
    if (!cid || !user) return;
    if (id) {
      setAllLetters((prev) => prev.map((x) => (x.id === id && x.coupleId === cid ? { ...x, ...l } : x)));
    } else {
      setAllLetters((prev) => [...prev, { ...l, id: genId('letter'), coupleId: cid, authorId: user.id, createdAt: Date.now() }]);
    }
  }, [cid, user, setAllLetters]);

  const deleteLetter = useCallback((id: string) => {
    setAllLetters((prev) => prev.filter((x) => !(x.id === id && x.coupleId === cid)));
  }, [cid, setAllLetters]);

  const saveMood = useCallback((m: Omit<MoodEntry, 'id' | 'coupleId' | 'createdAt'>) => {
    if (!cid) return;
    setAllMoods((prev) => [...prev, { ...m, id: genId('mood'), coupleId: cid, createdAt: Date.now() }]);
  }, [cid, setAllMoods]);

  const deleteMood = useCallback((id: string) => {
    setAllMoods((prev) => prev.filter((x) => !(x.id === id && x.coupleId === cid)));
  }, [cid, setAllMoods]);

  const saveTrack = useCallback((t: Omit<Track, 'id' | 'coupleId' | 'createdAt'>, id?: string) => {
    if (!cid || !user) return;
    if (id) setAllTracks((prev) => prev.map((x) => (x.id === id && x.coupleId === cid ? { ...x, ...t } : x)));
    else setAllTracks((prev) => [...prev, { ...t, id: genId('track'), coupleId: cid, addedBy: user.id, createdAt: Date.now() }]);
  }, [cid, user, setAllTracks]);

  const deleteTrack = useCallback((id: string) => {
    setAllTracks((prev) => prev.filter((x) => !(x.id === id && x.coupleId === cid)));
  }, [cid, setAllTracks]);

  const saveExpense = useCallback((e: Omit<Expense, 'id' | 'coupleId' | 'createdAt'>, id?: string) => {
    if (!cid) return;
    if (id) setAllExpenses((prev) => prev.map((x) => (x.id === id && x.coupleId === cid ? { ...x, ...e } : x)));
    else setAllExpenses((prev) => [...prev, { ...e, id: genId('exp'), coupleId: cid, createdAt: Date.now() }]);
  }, [cid, setAllExpenses]);

  const deleteExpense = useCallback((id: string) => {
    setAllExpenses((prev) => prev.filter((x) => !(x.id === id && x.coupleId === cid)));
  }, [cid, setAllExpenses]);

  const markRead = useCallback((id: string) => {
    setAllNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [setAllNotifications]);

  const markAllRead = useCallback(() => {
    if (!cid) return;
    setAllNotifications((prev) => prev.map((n) => (n.coupleId === cid ? { ...n, read: true } : n)));
  }, [cid, setAllNotifications]);

  const addWheel = useCallback((label: string, category: string) => {
    setWheel((prev) => [...prev, { id: genId('wheel'), label: label.trim(), category }]);
  }, [setWheel]);

  const deleteWheel = useCallback((id: string) => {
    setWheel((prev) => prev.filter((w) => w.id !== id));
  }, [setWheel]);

  const resetWheel = useCallback((defaults: { label: string; category: string }[]) => {
    setWheel(defaults.map((d) => ({ id: genId('wheel'), label: d.label, category: d.category })));
  }, [setWheel]);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState((prev) => ({ ...prev, ...patch }));
  }, [setPrefsState]);

  const exportData = useCallback(() => {
    const data = exportAll(ALL_KEYS);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `love-connect-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return 'backup exportado';
  }, []);

  void guard;

  const value: Store = {
    user, couple, users, couples, messages, memories, events, wishlist, movies,
    diary, letters, moods, tracks, expenses, notifications, wheel, prefs, unreadCount,
    register, login, logout, requestReset, confirmReset, updateProfile, deleteAccount,
    createCouple, joinCouple, updateCouple, leaveCouple,
    sendMessage, toggleReaction, deleteMessage,
    saveMemory, deleteMemory, saveEvent, deleteEvent, saveWish, deleteWish,
    saveMovie, deleteMovie, saveDiary, deleteDiary, saveLetter, deleteLetter,
    saveMood, deleteMood, saveTrack, deleteTrack, saveExpense, deleteExpense,
    pushNotification: (kind, title, body) => {
      if (!cid) return;
      const n: AppNotification = { id: genId('notif'), coupleId: cid, kind, title, body, read: false, createdAt: Date.now() };
      setAllNotifications((prev) => [...prev, n]);
    },
    markRead, markAllRead,
    addWheel, deleteWheel, resetWheel, setPrefs, exportData,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore fora do AppProvider');
  return ctx;
}
