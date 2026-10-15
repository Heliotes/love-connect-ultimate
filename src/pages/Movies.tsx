// Filmes e séries: catálogo compartilhado, status, notas, comentários, filtros.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { MOVIE_GENRES } from '../data/seed';
import { movieProgress } from '../utils/logic';
import { clampRating } from '../utils/validation';
import { Card, Empty, Modal, Field, Progress, Stars } from '../components/UI';

export default function Movies() {
  const { couple, movies, saveMovie, deleteMovie } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'filme' | 'serie'>('filme');
  const [status, setStatus] = useState<'quero-ver' | 'assistindo' | 'assistido'>('quero-ver');
  const [genre, setGenre] = useState(MOVIE_GENRES[0]);
  const [ratingA, setRatingA] = useState(0);
  const [ratingB, setRatingB] = useState(0);
  const [comment, setComment] = useState('');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const prog = useMemo(() => movieProgress(movies), [movies]);
  const filtered = useMemo(() => movies.filter((m) => {
    if (statusFilter !== 'todos' && m.status !== statusFilter) return false;
    if (q.trim() && !`${m.title} ${m.genre}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  }), [movies, statusFilter, q]);

  if (!couple) return <Card><h2>Filmes 🎬</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  function startNew() {
    setEditing(undefined); setTitle(''); setKind('filme'); setStatus('quero-ver');
    setGenre(MOVIE_GENRES[0]); setRatingA(0); setRatingB(0); setComment(''); setOpen(true);
  }
  function startEdit(id: string) {
    const m = movies.find((x) => x.id === id);
    if (!m) return;
    setEditing(id); setTitle(m.title); setKind(m.kind); setStatus(m.status);
    setGenre(m.genre); setRatingA(m.ratingA ?? 0); setRatingB(m.ratingB ?? 0); setComment(m.comment ?? ''); setOpen(true);
  }

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Filmes & séries 🎬</h1>
        <button className="btn" onClick={startNew}>+ Adicionar</button>
      </div>
      <Card>
        <p className="muted">{prog.done} de {prog.total} assistidos</p>
        <Progress percent={prog.percent} />
        <div className="row" style={{ marginTop: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 Pesquisar…" aria-label="Pesquisar filmes" style={{ flex: 1, font: 'inherit', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }} />
        </div>
        <div className="chiprow" style={{ marginTop: 8 }}>
          {[['todos', 'Todos'], ['quero-ver', '🍿 Quero ver'], ['assistindo', '▶ Assistindo'], ['assistido', '✅ Assistido']].map(([v, l]) => (
            <button key={v} className={`chip${statusFilter === v ? ' on' : ''}`} onClick={() => setStatusFilter(v)}>{l}</button>
          ))}
        </div>
      </Card>
      {filtered.length === 0 ? (
        <Empty icon="🎬" title="Catálogo vazio" hint="Montem a lista do próximo cinema em casa." action={<button className="btn small" onClick={startNew}>Adicionar</button>} />
      ) : (
        <div className="grid cols2">
          {filtered.map((m) => (
            <Card key={m.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{m.kind === 'filme' ? '🎬' : '📺'} {m.title}</strong>
                <span className="badge">{m.status}</span>
              </div>
              <p className="muted" style={{ fontSize: '0.82rem' }}>{m.genre}</p>
              {(m.ratingA || m.ratingB) ? <p>⭐ {couple.nameA}: {m.ratingA ?? '—'} · {couple.nameB}: {m.ratingB ?? '—'}</p> : null}
              {m.comment ? <p>💬 {m.comment}</p> : null}
              <div className="row">
                <button className="btn secondary small" onClick={() => startEdit(m.id)}>Editar</button>
                <button className="btn ghost small" onClick={() => { if (confirm(`Remover “${m.title}”?`)) deleteMovie(m.id); }}>Remover</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {open ? (
        <Modal title={editing ? 'Editar título' : 'Novo título'} onClose={() => setOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; saveMovie({ title: title.trim(), kind, status, genre, ratingA: ratingA || undefined, ratingB: ratingB || undefined, comment: comment.trim() || undefined }, editing); setOpen(false); }}>
            <Field label="Título"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required /></Field>
            <div className="grid cols2">
              <Field label="Tipo">
                <select value={kind} onChange={(e) => setKind(e.target.value as 'filme' | 'serie')}>
                  <option value="filme">🎬 Filme</option>
                  <option value="serie">📺 Série</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={status} onChange={(e) => setStatus(e.target.value as never)}>
                  <option value="quero-ver">🍿 Quero ver</option>
                  <option value="assistindo">▶ Assistindo</option>
                  <option value="assistido">✅ Assistido</option>
                </select>
              </Field>
            </div>
            <Field label="Gênero">
              <select value={genre} onChange={(e) => setGenre(e.target.value)}>{MOVIE_GENRES.map((g) => <option key={g} value={g}>{g}</option>)}</select>
            </Field>
            <div className="grid cols2">
              <div><p><strong>Nota {couple.nameA}</strong></p><Stars label={`Nota de ${couple.nameA}`} value={ratingA} onChange={(n) => setRatingA(clampRating(n))} /></div>
              <div><p><strong>Nota {couple.nameB}</strong></p><Stars label={`Nota de ${couple.nameB}`} value={ratingB} onChange={(n) => setRatingB(clampRating(n))} /></div>
            </div>
            <Field label="Comentário"><textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={400} /></Field>
            <div className="row">
              <button className="btn" type="submit">Salvar 🎬</button>
              <button className="btn secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
