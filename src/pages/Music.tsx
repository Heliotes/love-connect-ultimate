// Playlist compartilhada: título, artista, link, favoritos, memórias associadas.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { isURL } from '../utils/validation';
import { Card, Empty, Modal, Field } from '../components/UI';

export default function Music() {
  const { couple, tracks, saveTrack, deleteTrack } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [url, setUrl] = useState('');
  const [memoryTitle, setMemoryTitle] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  const filtered = useMemo(() => tracks.filter((t) => {
    if (favOnly && !t.favorite) return false;
    if (q.trim() && !`${t.title} ${t.artist}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  }), [tracks, favOnly, q]);

  if (!couple) return <Card><h2>Música 🎵</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr('Informe o nome da música.'); return; }
    if (!artist.trim()) { setErr('Informe o artista.'); return; }
    if (!isURL(url)) { setErr('Link inválido (use http/https ou deixe vazio).'); return; }
    saveTrack({ title: title.trim(), artist: artist.trim(), url: url.trim() || undefined, memoryTitle: memoryTitle.trim() || undefined, favorite: false, addedBy: '' as never });
    setTitle(''); setArtist(''); setUrl(''); setMemoryTitle(''); setErr(''); setOpen(false);
  }

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Nossa playlist 🎵</h1>
        <div className="row">
          <button className={`chip${favOnly ? ' on' : ''}`} onClick={() => setFavOnly((v) => !v)}>⭐ Favoritas</button>
          <button className="btn" onClick={() => setOpen(true)}>+ Música</button>
        </div>
      </div>
      <Card>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 Buscar música ou artista…" aria-label="Buscar músicas" style={{ width: '100%', font: 'inherit', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }} />
      </Card>
      {filtered.length === 0 ? (
        <Empty icon="🎵" title="Playlist vazia" hint="Adicionem a trilha sonora do amor." action={<button className="btn small" onClick={() => setOpen(true)}>Adicionar música</button>} />
      ) : (
        <div className="grid cols2">
          {filtered.map((t) => (
            <Card key={t.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>🎵 {t.title}</strong>
                <button className="btn ghost small" onClick={() => saveTrack({ title: t.title, artist: t.artist, url: t.url, memoryTitle: t.memoryTitle, favorite: !t.favorite, addedBy: t.addedBy }, t.id)} aria-label="Favoritar">{t.favorite ? '★' : '☆'}</button>
              </div>
              <p className="muted">{t.artist}</p>
              {t.memoryTitle ? <p>📸 Memória: {t.memoryTitle}</p> : null}
              <div className="row">
                {t.url ? <a className="btn secondary small" href={t.url} target="_blank" rel="noreferrer">Ouvir ↗</a> : null}
                <button className="btn ghost small" onClick={() => { if (confirm(`Remover “${t.title}”?`)) deleteTrack(t.id); }}>Remover</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {open ? (
        <Modal title="Nova música" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <Field label="Música"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} /></Field>
            <Field label="Artista"><input value={artist} onChange={(e) => setArtist(e.target.value)} maxLength={100} /></Field>
            <Field label="Link externo (opcional)"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></Field>
            <Field label="Memória associada (opcional)"><input value={memoryTitle} onChange={(e) => setMemoryTitle(e.target.value)} placeholder="Ex.: nossa viagem à praia" maxLength={100} /></Field>
            {err ? <p role="alert" style={{ color: '#c92a2a' }}>{err}</p> : null}
            <div className="row">
              <button className="btn" type="submit">Salvar 🎵</button>
              <button className="btn secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
