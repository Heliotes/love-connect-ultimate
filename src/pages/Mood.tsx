// Humor e sentimentos: registro com privacidade + sugestões leves.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { formatDateTimeBR } from '../utils/dates';
import { MOODS } from '../data/seed';
import { Card, Empty } from '../components/UI';

const SUGGESTIONS: Record<string, string> = {
  '😍': 'Que delícia! Registrem esse momento numa memória 📸',
  '😊': 'Dia bom! Que tal planejar algo na roleta? 🎡',
  '🥰': 'Clima de romance: escreva uma cartinha 💌',
  '😴': 'Descansem juntinhos e maratonem uma série 🎬',
  '😟': 'Respirem fundo. Uma conversa no chat ajuda 💬',
  '😢': 'Abrace (mesmo à distância) e escrevam no diário 📖',
  '😡': 'Pausa com carinho: cada um escreve 3 gratidões 🙏',
  '🤒': 'Melhoras! Prepare um chá e um filme leve 🍵',
};

export default function Mood() {
  const { user, couple, users, moods, saveMood, deleteMood } = useStore();
  const [mood, setMood] = useState('😊');
  const [note, setNote] = useState('');
  const [priv, setPriv] = useState(false);

  const visible = useMemo(() => {
    if (!user) return [];
    return moods.filter((m) => !m.priv || m.authorId === user.id);
  }, [moods, user]);

  if (!user || !couple) return <Card><h2>Humor 💗</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name.split(' ')[0] ?? 'Amor';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveMood({ mood, note: note.trim() || undefined, priv, authorId: user!.id });
    setNote('');
  }

  return (
    <div className="grid">
      <h1 style={{ margin: 0 }}>Humor 💗</h1>
      <Card>
        <h3>Como você está agora?</h3>
        <form onSubmit={submit}>
          <div className="row" style={{ fontSize: '2rem' }} role="radiogroup" aria-label="Humor">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                aria-label={m}
                style={{
                  background: mood === m ? 'var(--border)' : 'transparent',
                  border: mood === m ? '2px solid var(--accent)' : '2px solid transparent',
                  borderRadius: 12, cursor: 'pointer',
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label>Mensagem opcional
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: dia corrido, mas com saudade 💕" maxLength={200} />
            </label>
          </div>
          <label className="row"><input type="checkbox" checked={priv} onChange={(e) => setPriv(e.target.checked)} /> Manter privado (só eu vejo) 🔒</label>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn" type="submit">Registrar {mood}</button>
          </div>
        </form>
        <p className="muted" style={{ marginTop: 8 }}>💡 {SUGGESTIONS[mood]}</p>
      </Card>

      <Card>
        <h3>Histórico</h3>
        {visible.length === 0 ? (
          <Empty icon="💗" title="Sem registros" hint="O primeiro check-in emocional começa aqui." />
        ) : visible.slice(0, 30).map((m) => (
          <div key={m.id} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
            <span style={{ fontSize: '1.3rem' }}>{m.mood} <strong>{nameOf(m.authorId)}</strong>{m.priv ? ' 🔒' : ''} <span className="muted">· {formatDateTimeBR(m.createdAt)}{m.note ? ` · “${m.note}”` : ''}</span></span>
            {m.authorId === user.id ? <button className="btn ghost small" onClick={() => deleteMood(m.id)}>Apagar</button> : null}
          </div>
        ))}
      </Card>
    </div>
  );
}
