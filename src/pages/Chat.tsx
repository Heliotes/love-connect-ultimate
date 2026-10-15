// Chat privado do casal: mensagens, imagens, reações, respostas, anti-duplicadas.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store/AppStore';
import { formatTimeBR, formatDateBR, todayISO } from '../utils/dates';
import { genId } from '../utils/id';
import { Card, Empty, Modal } from '../components/UI';

const EMOJIS = ['❤️', '😂', '😮', '😢', '👏', '🔥'];

export default function Chat() {
  const { user, couple, users, messages, sendMessage, toggleReaction, deleteMessage } = useStore();
  const [text, setText] = useState('');
  const [replyId, setReplyId] = useState<string>('');
  const [reactId, setReactId] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [fail, setFail] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  if (!user || !couple) {
    return (
      <Card>
        <h2>Chat privado 💬</h2>
        <p className="muted">Entre e monte o espaço do casal para conversar.</p>
      </Card>
    );
  }

  const nameOf = (id: string) => users.find((u) => u.id === id)?.name.split(' ')[0] ?? 'Amor';
  const replyMsg = messages.find((m) => m.id === replyId);

  // Separadores de dia pré-computados (evita mutação durante o render)
  const dayBreaks = useMemo(() => {
    const breaks = new Set<string>();
    let prev = '';
    for (const m of messages) {
      const day = formatDateBR(todayISO(new Date(m.createdAt)));
      if (day !== prev) breaks.add(m.id);
      prev = day;
    }
    return breaks;
  }, [messages]);

  async function onImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setFail('Selecione um arquivo de imagem.'); return; }
    if (file.size > 8 * 1024 * 1024) { setFail('Imagem muito grande (máx. 8 MB).'); return; }
    setSending(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error('Falha ao ler imagem'));
        r.readAsDataURL(file);
      });
      sendMessage(text, dataUrl, replyId || undefined, genId('ck'));
      setText(''); setReplyId(''); setFail('');
    } catch {
      setFail('Não foi possível enviar a imagem. Tente de novo.');
    } finally {
      setSending(false);
    }
  }

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) { setFail('Escreva uma mensagem primeiro.'); return; }
    try {
      sendMessage(text, undefined, replyId || undefined, genId('ck'));
      setText(''); setReplyId(''); setFail('');
    } catch {
      setFail('Falha ao enviar. Sua mensagem não foi perdida: tente novamente.');
    }
  }

  const unreadFrom = messages.filter((m) => m.authorId !== user.id).length;

  return (
    <div className="grid">
      <Card>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Chat 💬</h2>
          <span className="badge">{messages.length} mensagens</span>
        </div>
        <p className="muted">Histórico salvo neste dispositivo · {unreadFrom} mensagens do seu amor</p>
      </Card>

      {messages.length === 0 ? (
        <Empty icon="💌" title="Comecem a conversa" hint="A primeira mensagem a dois começa aqui." />
      ) : (
        <Card>
          <div className="chat" aria-live="polite">
            {messages.map((m) => {
              const day = formatDateBR(todayISO(new Date(m.createdAt)));
              const showDay = dayBreaks.has(m.id);
              const mine = m.authorId === user.id;
              return (
                <div key={m.id}>
                  {showDay ? <p className="muted" style={{ textAlign: 'center', fontSize: '0.78rem' }}>— {day} —</p> : null}
                  <div className={`bubble${mine ? ' me' : ''}`}>
                    {!mine ? <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{nameOf(m.authorId)}</div> : null}
                    {m.replyTo ? (
                      <div style={{ fontSize: '0.78rem', opacity: 0.85, borderLeft: '3px solid currentColor', paddingLeft: 8, marginBottom: 6 }}>
                        {messages.find((x) => x.id === m.replyTo)?.text.slice(0, 80) ?? 'Mensagem original'}
                      </div>
                    ) : null}
                    {m.image ? <img src={m.image} alt="Imagem enviada no chat" loading="lazy" /> : null}
                    {m.text ? <div>{m.text}</div> : null}
                    <div className="meta">{formatTimeBR(m.createdAt)} · {mine ? 'você' : nameOf(m.authorId)}</div>
                    {Object.keys(m.reactions).length > 0 ? (
                      <div className="chiprow" style={{ marginTop: 6 }}>
                        {Object.entries(m.reactions).filter(([, ids]) => ids.length > 0).map(([emoji, ids]) => (
                          <button key={emoji} className="chip" onClick={() => toggleReaction(m.id, emoji)} aria-label={`Reação ${emoji}`}>
                            {emoji} {ids.length}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="row" style={{ marginTop: 6, gap: 6 }}>
                      <button className="btn ghost small" onClick={() => setReplyId(m.id)}>↩ Responder</button>
                      <button className="btn ghost small" onClick={() => setReactId(m.id)}>😊 Reagir</button>
                      {mine ? <button className="btn ghost small" onClick={() => { if (confirm('Apagar esta mensagem?')) deleteMessage(m.id); }}>🗑</button> : null}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </Card>
      )}

      <Card>
        {replyMsg ? (
          <p className="muted">Respondendo: “{replyMsg.text.slice(0, 80)}” <button className="btn ghost small" onClick={() => setReplyId('')}>cancelar</button></p>
        ) : null}
        <form onSubmit={onSend}>
          <div className="row">
            <input
              aria-label="Escrever mensagem"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva com amor…"
              maxLength={1000}
              style={{ flex: 1, font: 'inherit', padding: '11px 13px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }}
            />
            <label className="btn secondary small" style={{ cursor: 'pointer' }}>
              📷
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void onImage(e.target.files?.[0]); e.target.value = ''; }} />
            </label>
            <button className="btn" type="submit" disabled={sending}>{sending ? '…' : 'Enviar 💕'}</button>
          </div>
        </form>
        {fail ? <p role="alert" style={{ color: '#c92a2a' }}>{fail}</p> : null}
      </Card>

      {reactId ? (
        <Modal title="Reagir" onClose={() => setReactId('')}>
          <div className="row" style={{ fontSize: '1.6rem' }}>
            {EMOJIS.map((e) => (
              <button key={e} className="btn secondary" onClick={() => { toggleReaction(reactId, e); setReactId(''); }} aria-label={`Reagir com ${e}`}>{e}</button>
            ))}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
