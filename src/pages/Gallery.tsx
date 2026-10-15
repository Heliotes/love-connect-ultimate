// Galeria de memórias: fotos, álbuns, legendas, favoritos, busca, linha do tempo.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { todayISO, formatDateBR } from '../utils/dates';
import { Card, Empty, Modal, Field } from '../components/UI';
import { fileToDataURL } from '../components/UI';

export default function Gallery() {
  const { couple, memories, saveMemory, deleteMemory } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(todayISO());
  const [album, setAlbum] = useState('Nossa história');
  const [image, setImage] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [q, setQ] = useState('');
  const [albumFilter, setAlbumFilter] = useState('Todos');
  const [favOnly, setFavOnly] = useState(false);
  const [view, setView] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const albums = useMemo(() => ['Todos', ...new Set(memories.map((m) => m.album))], [memories]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return memories.filter((m) => {
      if (albumFilter !== 'Todos' && m.album !== albumFilter) return false;
      if (favOnly && !m.favorite) return false;
      if (!needle) return true;
      return `${m.title} ${m.caption} ${m.album}`.toLowerCase().includes(needle);
    });
  }, [memories, q, albumFilter, favOnly]);

  if (!couple) return <Card><h2>Galeria 📸</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  function startNew() {
    setEditing(undefined); setTitle(''); setCaption(''); setDate(todayISO());
    setAlbum('Nossa história'); setImage(''); setFavorite(false); setErr(''); setOpen(true);
  }

  function startEdit(id: string) {
    const m = memories.find((x) => x.id === id);
    if (!m) return;
    setEditing(id); setTitle(m.title); setCaption(m.caption); setDate(m.date);
    setAlbum(m.album); setImage(m.image); setFavorite(m.favorite); setErr(''); setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr('Dê um título à memória.'); return; }
    saveMemory({ title: title.trim(), caption: caption.trim(), date, album: album.trim() || 'Nossa história', image, favorite }, editing);
    setOpen(false);
  }

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Memórias 📸</h1>
        <button className="btn" onClick={startNew}>+ Nova memória</button>
      </div>

      <Card>
        <div className="row">
          <input aria-label="Pesquisar memórias" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 Pesquisar…" style={{ flex: 1, font: 'inherit', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }} />
          <button className={`chip${favOnly ? ' on' : ''}`} onClick={() => setFavOnly((v) => !v)}>⭐ Favoritas</button>
        </div>
        <div className="chiprow" style={{ marginTop: 8 }}>
          {albums.map((a) => (
            <button key={a} className={`chip${albumFilter === a ? ' on' : ''}`} onClick={() => setAlbumFilter(a)}>{a}</button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Empty icon="📷" title="Nenhuma memória aqui" hint="Adicione fotos, legendas e datas especiais." action={<button className="btn small" onClick={startNew}>Criar memória</button>} />
      ) : (
        <div className="grid cols3 gallery">
          {filtered.map((m) => (
            <Card key={m.id}>
              {m.image ? (
                <button onClick={() => setView(m.id)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'zoom-in', width: '100%' }} aria-label={`Ampliar ${m.title}`}>
                  <img src={m.image} alt={m.title} loading="lazy" style={{ height: 180 }} />
                </button>
              ) : null}
              <h3>{m.favorite ? '⭐ ' : ''}{m.title}</h3>
              <p className="muted" style={{ fontSize: '0.82rem' }}>{formatDateBR(m.date)} · {m.album}</p>
              {m.caption ? <p>{m.caption}</p> : null}
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn secondary small" onClick={() => startEdit(m.id)}>Editar</button>
                <button className="btn secondary small" onClick={() => saveMemory({ title: m.title, caption: m.caption, date: m.date, album: m.album, image: m.image, favorite: !m.favorite }, m.id)} aria-label="Favoritar">
                  {m.favorite ? '★' : '☆'}
                </button>
                <button className="btn ghost small" onClick={() => { if (confirm(`Apagar “${m.title}”?`)) deleteMemory(m.id); }}>Apagar</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {open ? (
        <Modal title={editing ? 'Editar memória' : 'Nova memória'} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <Field label="Título"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} /></Field>
            <Field label="Legenda"><textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={500} /></Field>
            <div className="grid cols2">
              <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Field>
              <Field label="Álbum"><input value={album} onChange={(e) => setAlbum(e.target.value)} maxLength={40} list="albums" /><datalist id="albums">{albums.filter((a) => a !== 'Todos').map((a) => <option key={a} value={a} />)}</datalist></Field>
            </div>
            <Field label="Foto">
              <input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) fileToDataURL(f).then(setImage).catch(() => setErr('Não foi possível ler a imagem.'));
              }} />
            </Field>
            {image ? <img src={image} alt="Prévia" style={{ width: '100%', borderRadius: 12, marginBottom: 8 }} /> : null}
            <label className="row"><input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} /> Marcar como favorita ⭐</label>
            {err ? <p role="alert" style={{ color: '#c92a2a' }}>{err}</p> : null}
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn" type="submit">Salvar 💖</button>
              <button className="btn secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {view ? (
        <Modal title={memories.find((m) => m.id === view)?.title ?? 'Memória'} onClose={() => setView(null)}>
          {(() => {
            const m = memories.find((x) => x.id === view);
            if (!m) return null;
            return (
              <div>
                {m.image ? <img src={m.image} alt={m.title} style={{ width: '100%' }} /> : null}
                <p className="muted">{formatDateBR(m.date)} · {m.album}</p>
                <p>{m.caption}</p>
              </div>
            );
          })()}
        </Modal>
      ) : null}
    </div>
  );
}
