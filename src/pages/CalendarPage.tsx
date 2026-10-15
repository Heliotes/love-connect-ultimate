// Calendário: visão mensal/semanal, categorias, lembretes, CRUD.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { monthGrid, monthLabelPT, todayISO, formatDateBR } from '../utils/dates';
import { EVENT_CATEGORIES } from '../data/seed';
import { Card, Empty, Modal, Field } from '../components/UI';

const CAT_ICON: Record<string, string> = {
  encontro: '💕', viagem: '✈️', aniversario: '🎂', especial: '🌟', lembrete: '⏰', outro: '📌',
};

export default function CalendarPage() {
  const { couple, events, saveEvent, deleteEvent } = useStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [weekMode, setWeekMode] = useState(false);
  const [cat, setCat] = useState('todas');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('encontro');
  const [notes, setNotes] = useState('');
  const [reminderDays, setReminderDays] = useState(1);
  const [err, setErr] = useState('');

  const grid = useMemo(() => monthGrid(year, month), [year, month]);
  const byDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const e of events) {
      if (cat !== 'todas' && e.category !== cat) continue;
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events, cat]);
  const upcoming = useMemo(() => events.filter((e) => e.date >= todayISO()).slice(0, 8), [events]);

  if (!couple) return <Card><h2>Agenda 📅</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  function startNew(day?: string) {
    setEditing(undefined); setTitle(''); setDate(day ?? todayISO()); setTime('');
    setCategory('encontro'); setNotes(''); setReminderDays(1); setErr(''); setOpen(true);
  }
  function startEdit(id: string) {
    const e = events.find((x) => x.id === id);
    if (!e) return;
    setEditing(id); setTitle(e.title); setDate(e.date); setTime(e.time ?? '');
    setCategory(e.category); setNotes(e.notes ?? ''); setReminderDays(e.reminderDays); setErr(''); setOpen(true);
  }
  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!title.trim()) { setErr('Dê um título ao evento.'); return; }
    if (!date) { setErr('Escolha a data.'); return; }
    saveEvent({ title: title.trim(), date, time: time || undefined, category: category as never, notes: notes.trim() || undefined, reminderDays }, editing);
    setOpen(false);
  }

  const weeks = weekMode
    ? grid.filter((w) => w.includes(todayISO()) || w.some((d) => (byDate.get(d ?? '') ?? []).length > 0)).slice(0, 2)
    : grid;
  const shownWeeks = weekMode && weeks.length === 0 ? [grid[0]] : weeks;

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Agenda 📅</h1>
        <button className="btn" onClick={() => startNew()}>+ Novo evento</button>
      </div>

      <Card>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row">
            <button className="btn secondary small" onClick={() => { const m = month - 1; if (m < 0) { setMonth(11); setYear(year - 1); } else setMonth(m); }} aria-label="Mês anterior">‹</button>
            <strong>{monthLabelPT(year, month)}</strong>
            <button className="btn secondary small" onClick={() => { const m = month + 1; if (m > 11) { setMonth(0); setYear(year + 1); } else setMonth(m); }} aria-label="Próximo mês">›</button>
            <button className="btn secondary small" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }}>Hoje</button>
          </div>
          <div className="row">
            <button className={`chip${!weekMode ? ' on' : ''}`} onClick={() => setWeekMode(false)}>Mensal</button>
            <button className={`chip${weekMode ? ' on' : ''}`} onClick={() => setWeekMode(true)}>Destaques</button>
          </div>
        </div>
        <div className="chiprow" style={{ marginTop: 8 }}>
          {['todas', ...EVENT_CATEGORIES].map((c) => (
            <button key={c} className={`chip${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>{c === 'todas' ? 'Todas' : `${CAT_ICON[c]} ${c}`}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 12 }} role="grid" aria-label="Calendário">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
            <div key={i} className="muted" style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.75rem' }}>{d}</div>
          ))}
          {shownWeeks.flat().map((d, i) => (
            <button
              key={i}
              disabled={!d}
              onClick={() => d && startNew(d)}
              style={{
                minHeight: 56, borderRadius: 12, border: d === todayISO() ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: d ? 'var(--bg-soft)' : 'transparent', color: 'var(--text)', cursor: d ? 'pointer' : 'default',
                fontSize: '0.75rem', fontWeight: 700, padding: 4,
              }}
              aria-label={d ? `Eventos de ${formatDateBR(d)}` : 'Dia vazio'}
            >
              {d ? (
                <span>
                  {d.slice(8, 10)}
                  {(byDate.get(d) ?? []).slice(0, 2).map((e) => (
                    <span key={e.id} style={{ display: 'block', fontSize: '0.62rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {CAT_ICON[e.category]} {e.title}
                    </span>
                  ))}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3>📌 Próximos compromissos</h3>
        {upcoming.length === 0 ? (
          <Empty icon="🗓️" title="Agenda livre" hint="Planejem o próximo encontro." />
        ) : (
          upcoming.map((e) => (
            <div key={e.id} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
              <span>{CAT_ICON[e.category]} <strong>{e.title}</strong> <span className="muted">· {formatDateBR(e.date)}{e.time ? ` às ${e.time}` : ''} · {e.category}</span></span>
              <span className="row">
                <button className="btn secondary small" onClick={() => startEdit(e.id)}>Editar</button>
                <button className="btn ghost small" onClick={() => { if (confirm(`Apagar “${e.title}”?`)) deleteEvent(e.id); }}>Apagar</button>
              </span>
            </div>
          ))
        )}
      </Card>

      {open ? (
        <Modal title={editing ? 'Editar evento' : 'Novo evento'} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <Field label="Título"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} /></Field>
            <div className="grid cols2">
              <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Field>
              <Field label="Hora (opcional)"><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
            </div>
            <div className="grid cols2">
              <Field label="Categoria">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
                </select>
              </Field>
              <Field label="Lembrar com (dias antes)"><input type="number" min={0} max={30} value={reminderDays} onChange={(e) => setReminderDays(Number(e.target.value))} /></Field>
            </div>
            <Field label="Notas"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={400} /></Field>
            {err ? <p role="alert" style={{ color: '#c92a2a' }}>{err}</p> : null}
            <div className="row">
              <button className="btn" type="submit">Salvar 💖</button>
              <button className="btn secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
