// Lista de desejos: categorias, prioridades, progresso, filtros.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { Card, Empty, Modal, Field, Progress } from '../components/UI';
import { wishProgress } from '../utils/logic';

const CATS = ['Viagens', 'Filmes', 'Restaurantes', 'Experiências', 'Objetivos', 'Outros'];
const PRIORITY = { 1: '⭐ Alta', 2: '✨ Média', 3: '🌱 Baixa' } as const;

export default function Wishlist() {
  const { couple, wishlist, saveWish, deleteWish } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATS[0]);
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [targetDate, setTargetDate] = useState('');
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');
  const [hideDone, setHideDone] = useState(false);

  const prog = useMemo(() => wishProgress(wishlist), [wishlist]);
  const filtered = useMemo(() => wishlist.filter((w) => {
    if (catFilter !== 'Todas' && w.category !== catFilter) return false;
    if (hideDone && w.done) return false;
    if (q.trim() && !w.title.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  }).sort((a, b) => a.priority - b.priority), [wishlist, catFilter, hideDone, q]);

  if (!couple) return <Card><h2>Desejos 🌟</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  function startNew() {
    setEditing(undefined); setTitle(''); setCategory(CATS[0]); setPriority(2); setTargetDate(''); setOpen(true);
  }
  function startEdit(id: string) {
    const w = wishlist.find((x) => x.id === id);
    if (!w) return;
    setEditing(id); setTitle(w.title); setCategory(w.category); setPriority(w.priority); setTargetDate(w.targetDate ?? ''); setOpen(true);
  }

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Desejos 🌟</h1>
        <button className="btn" onClick={startNew}>+ Novo desejo</button>
      </div>
      <Card>
        <p className="muted">{prog.done} de {prog.total} realizados ({prog.percent}%)</p>
        <Progress percent={prog.percent} />
        <div className="row" style={{ marginTop: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 Pesquisar…" aria-label="Pesquisar desejos" style={{ flex: 1, font: 'inherit', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }} />
          <button className={`chip${hideDone ? ' on' : ''}`} onClick={() => setHideDone((v) => !v)}>Ocultar concluídos</button>
        </div>
        <div className="chiprow" style={{ marginTop: 8 }}>
          {['Todas', ...CATS].map((c) => (
            <button key={c} className={`chip${catFilter === c ? ' on' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
          ))}
        </div>
      </Card>
      {filtered.length === 0 ? (
        <Empty icon="🌟" title="Nenhum desejo aqui" hint="Sonhem juntos: viagens, filmes, experiências…" action={<button className="btn small" onClick={startNew}>Adicionar desejo</button>} />
      ) : filtered.map((w) => (
        <Card key={w.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <label className="row">
              <input type="checkbox" checked={w.done} onChange={() => saveWish({ title: w.title, category: w.category, priority: w.priority, targetDate: w.targetDate, done: !w.done }, w.id)} aria-label={`Concluir ${w.title}`} />
              <strong style={{ textDecoration: w.done ? 'line-through' : 'none' }}>{w.title}</strong>
            </label>
            <span className="badge">{PRIORITY[w.priority]}</span>
          </div>
          <p className="muted" style={{ fontSize: '0.82rem' }}>{w.category}{w.targetDate ? ` · até ${w.targetDate.split('-').reverse().join('/')}` : ''}</p>
          <div className="row">
            <button className="btn secondary small" onClick={() => startEdit(w.id)}>Editar</button>
            <button className="btn ghost small" onClick={() => { if (confirm(`Apagar “${w.title}”?`)) deleteWish(w.id); }}>Apagar</button>
          </div>
        </Card>
      ))}
      {open ? (
        <Modal title={editing ? 'Editar desejo' : 'Novo desejo'} onClose={() => setOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; saveWish({ title: title.trim(), category, priority, targetDate: targetDate || undefined, done: editing ? (wishlist.find((w) => w.id === editing)?.done ?? false) : false }, editing); setOpen(false); }}>
            <Field label="Desejo"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required /></Field>
            <div className="grid cols2">
              <Field label="Categoria">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>{CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
              </Field>
              <Field label="Prioridade">
                <select value={priority} onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}>
                  <option value={1}>{PRIORITY[1]}</option>
                  <option value={2}>{PRIORITY[2]}</option>
                  <option value={3}>{PRIORITY[3]}</option>
                </select>
              </Field>
            </div>
            <Field label="Data alvo (opcional)"><input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></Field>
            <div className="row">
              <button className="btn" type="submit">Salvar 🌟</button>
              <button className="btn secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
