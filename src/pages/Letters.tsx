// Cartas digitais: rascunhos, programadas (respeito a fuso), animações, entrega.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { letterEffectiveStatus } from '../utils/logic';
import { formatDateTimeBR } from '../utils/dates';
import { COVERS } from '../data/seed';
import { Card, Empty, Modal, Field } from '../components/UI';

function toLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Letters() {
  const { couple, users, letters, saveLetter, deleteLetter, pushNotification } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cover, setCover] = useState(COVERS[0]);
  const [deliverAt, setDeliverAt] = useState('');
  const [reading, setReading] = useState<string | null>(null);
  const [filter, setFilter] = useState('todas');
  const [err, setErr] = useState('');

  const withStatus = useMemo(() => letters.map((l) => ({ ...l, eff: letterEffectiveStatus(l) })), [letters]);
  const filtered = useMemo(() => withStatus.filter((l) => filter === 'todas' || l.eff === filter), [withStatus, filter]);
  const now = Date.now();

  if (!couple) return <Card><h2>Cartas 💌</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name.split(' ')[0] ?? 'Amor';

  function startNew() {
    setEditing(undefined); setTitle(''); setBody(''); setCover(COVERS[0]); setDeliverAt(''); setErr(''); setOpen(true);
  }
  function startEdit(id: string) {
    const l = letters.find((x) => x.id === id);
    if (!l) return;
    setEditing(id); setTitle(l.title); setBody(l.body); setCover(l.cover); setDeliverAt(toLocalInput(l.deliverAt)); setErr(''); setOpen(true);
  }
  function submit(scheduled: boolean) {
    if (!title.trim()) { setErr('Dê um título à carta.'); return; }
    if (!body.trim()) { setErr('Escreva a carta.'); return; }
    let status: 'rascunho' | 'programada' = 'rascunho';
    let iso: string | undefined;
    if (scheduled) {
      if (!deliverAt) { setErr('Escolha data e hora da entrega.'); return; }
      const dt = new Date(deliverAt);
      if (Number.isNaN(dt.getTime())) { setErr('Data inválida.'); return; }
      if (dt.getTime() <= Date.now()) { setErr('A entrega precisa ser numa data futura.'); return; }
      status = 'programada';
      iso = dt.toISOString();
    }
    saveLetter({ title: title.trim(), body: body.trim(), cover, status, deliverAt: iso, authorId: '' as never }, editing);
    if (scheduled) pushNotification('carta', 'Carta programada 💌', `“${title.trim()}” será entregue na data escolhida.`);
    setOpen(false);
  }

  const readLetter = withStatus.find((l) => l.id === reading);

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Cartas 💌</h1>
        <button className="btn" onClick={startNew}>+ Nova carta</button>
      </div>
      <div className="chiprow">
        {[['todas', 'Todas'], ['rascunho', '📝 Rascunhos'], ['programada', '⏳ Programadas'], ['entregue', '💖 Entregues']].map(([v, l]) => (
          <button key={v} className={`chip${filter === v ? ' on' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Empty icon="💌" title="Nenhuma carta aqui" hint="Escreva algo que o coração sente." action={<button className="btn small" onClick={startNew}>Escrever carta</button>} />
      ) : (
        <div className="grid cols2">
          {filtered.map((l) => (
            <Card key={l.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="letter-cover" aria-hidden>{l.cover}</span>
                <span className={`badge${l.eff === 'entregue' ? ' green' : l.eff === 'programada' ? ' gold' : ''}`}>{l.eff}</span>
              </div>
              <h3>{l.title}</h3>
              <p className="muted" style={{ fontSize: '0.82rem' }}>
                de {nameOf(l.authorId)}
                {l.deliverAt ? ` · entrega: ${formatDateTimeBR(new Date(l.deliverAt).getTime())}` : ''}
              </p>
              <div className="row">
                <button className="btn small" onClick={() => setReading(l.id)}>
                  {l.eff === 'programada' && l.deliverAt && new Date(l.deliverAt).getTime() > now ? 'Ver ⏳' : 'Ler 💖'}
                </button>
                <button className="btn secondary small" onClick={() => startEdit(l.id)}>Editar</button>
                <button className="btn ghost small" onClick={() => { if (confirm('Apagar esta carta?')) deleteLetter(l.id); }}>Apagar</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {open ? (
        <Modal title={editing ? 'Editar carta' : 'Nova carta'} onClose={() => setOpen(false)}>
          <form onSubmit={(e) => e.preventDefault()}>
            <Field label="Capa">
              <div className="row" style={{ fontSize: '1.6rem' }}>
                {COVERS.map((c) => (
                  <button key={c} type="button" className={`chip${cover === c ? ' on' : ''}`} onClick={() => setCover(c)} aria-label={`Capa ${c}`}>{c}</button>
                ))}
              </div>
            </Field>
            <Field label="Título"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} /></Field>
            <Field label="Carta"><textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} rows={8} /></Field>
            <Field label="Entrega programada (opcional — respeita seu fuso horário)">
              <input type="datetime-local" value={deliverAt} onChange={(e) => setDeliverAt(e.target.value)} />
            </Field>
            {err ? <p role="alert" style={{ color: '#c92a2a' }}>{err}</p> : null}
            <div className="row">
              <button className="btn secondary" type="button" onClick={() => submit(false)}>Salvar rascunho</button>
              <button className="btn" type="button" onClick={() => submit(true)}>Programar 💌</button>
            </div>
          </form>
        </Modal>
      ) : null}
      {readLetter ? (
        <Modal title={`${readLetter.cover} ${readLetter.title}`} onClose={() => setReading(null)}>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: 1.7 }}>{readLetter.body}</p>
          <p className="muted">Com amor, {nameOf(readLetter.authorId)} 💗</p>
        </Modal>
      ) : null}
    </div>
  );
}
