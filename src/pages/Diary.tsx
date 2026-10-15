// Diário compartilhado: entradas com foto opcional, favoritos, linha do tempo.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { todayISO, formatDateBR, formatTimeBR } from '../utils/dates';
import { Card, Empty, Modal, Field, fileToDataURL } from '../components/UI';

export default function Diary() {
  const { couple, users, diary, saveDiary, deleteDiary } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState(todayISO());
  const [photo, setPhoto] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const [err, setErr] = useState('');

  const filtered = useMemo(() => diary.filter((d) => !favOnly || d.favorite), [diary, favOnly]);
  if (!couple) return <Card><h2>Diário 📖</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  const nameOf = (id: string) => users.find((u) => u.id === id)?.name.split(' ')[0] ?? 'Amor';

  function startNew() {
    setEditing(undefined); setTitle(''); setBody(''); setDate(todayISO()); setPhoto(''); setFavorite(false); setErr(''); setOpen(true);
  }
  function startEdit(id: string) {
    const d = diary.find((x) => x.id === id);
    if (!d) return;
    setEditing(id); setTitle(d.title); setBody(d.body); setDate(d.date); setPhoto(d.photo ?? ''); setFavorite(d.favorite); setErr(''); setOpen(true);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr('Dê um título à entrada.'); return; }
    if (!body.trim()) { setErr('Escreva o texto do dia.'); return; }
    saveDiary({ title: title.trim(), body: body.trim(), date, photo: photo || undefined, favorite, authorId: '' as never }, editing);
    setOpen(false);
  }

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Diário 📖</h1>
        <div className="row">
          <button className={`chip${favOnly ? ' on' : ''}`} onClick={() => setFavOnly((v) => !v)}>⭐ Favoritos</button>
          <button className="btn" onClick={startNew}>+ Escrever</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <Empty icon="📖" title="Página em branco" hint="Registrem o dia, um sonho ou uma gratidão." action={<button className="btn small" onClick={startNew}>Primeira entrada</button>} />
      ) : (
        <div className="timeline grid">
          {filtered.map((d) => (
            <Card key={d.id}>
              {d.photo ? <img src={d.photo} alt={d.title} loading="lazy" style={{ maxHeight: 260 }} /> : null}
              <h3>{d.favorite ? '⭐ ' : ''}{d.title}</h3>
              <p className="muted" style={{ fontSize: '0.82rem' }}>{formatDateBR(d.date)} · por {nameOf(d.authorId)} · editado às {formatTimeBR(d.updatedAt)}</p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{d.body}</p>
              <div className="row">
                <button className="btn secondary small" onClick={() => startEdit(d.id)}>Editar</button>
                <button className="btn ghost small" onClick={() => { if (confirm('Apagar esta entrada?')) deleteDiary(d.id); }}>Apagar</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {open ? (
        <Modal title={editing ? 'Editar entrada' : 'Nova entrada'} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <Field label="Título"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} /></Field>
            <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Field>
            <Field label="Texto"><textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} rows={6} /></Field>
            <Field label="Foto (opcional)">
              <input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) fileToDataURL(f).then(setPhoto).catch(() => setErr('Não foi possível ler a imagem.'));
              }} />
            </Field>
            {photo ? <img src={photo} alt="Prévia" style={{ width: '100%', borderRadius: 12, marginBottom: 8 }} /> : null}
            <label className="row"><input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} /> Favorita ⭐</label>
            {err ? <p role="alert" style={{ color: '#c92a2a' }}>{err}</p> : null}
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn" type="submit">Salvar 📖</button>
              <button className="btn secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
