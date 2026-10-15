// Jogos reais do casal: quiz, memória, mais-provável, verdade/desafio, compatibilidade.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { KNOW_QUIZ, MEMORY_QUESTIONS, MOST_LIKELY, TRUTH_LIGHT, DARE_LIGHT } from '../data/seed';
import { scoreQuiz, compatibilityMessage } from '../utils/logic';
import { Card, Empty } from '../components/UI';

type GameId = 'conhece' | 'memorias' | 'provavel' | 'verdade' | 'compat';

const GAMES: { id: GameId; icon: string; name: string; desc: string }[] = [
  { id: 'conhece', icon: '🧠', name: 'Quanto você me conhece?', desc: 'Responda e compare com seu amor.' },
  { id: 'memorias', icon: '💭', name: 'Perguntas sobre memórias', desc: 'Relembrem a história juntos.' },
  { id: 'provavel', icon: '😄', name: 'Quem é mais provável?', desc: 'Apontem um para o outro e riam.' },
  { id: 'verdade', icon: '🌶️', name: 'Verdade ou desafio leve', desc: 'Versão carinhosa e divertida.' },
  { id: 'compat', icon: '💖', name: 'Quiz de compatibilidade', desc: 'Descubram a sintonia (recreativo).' },
];

const COMPAT_QS = [
  { id: 'c1', q: 'Programa ideal de sábado?', choices: ['Cinema em casa', 'Sair p/ jantar', 'Trilha', 'Festa'] },
  { id: 'c2', q: 'Como demonstram amor?', choices: ['Palavras', 'Presentes', 'Tempo junto', 'Carinho'] },
  { id: 'c3', q: 'Viagem ideal?', choices: ['Praia', 'Serra', 'Cidade grande', 'Acampar'] },
  { id: 'c4', q: 'À noite vocês…', choices: ['Série', 'Jogos', 'Conversas longas', 'Ler'] },
  { id: 'c5', q: 'Comida do date?', choices: ['Pizza', 'Japonesa', 'Churrasco', 'Massas'] },
];

export default function Games() {
  const { couple, pushNotification } = useStore();
  const [game, setGame] = useState<GameId>('conhece');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customQ, setCustomQ] = useState('');
  const [customList, setCustomList] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState('');
  const [done, setDone] = useState(false);

  const correct = useMemo(() => Object.fromEntries(KNOW_QUIZ.map((q) => [q.id, q.answer ?? ''])), []);
  const result = useMemo(() => (done && game === 'conhece' ? scoreQuiz(answers, correct) : null), [done, game, answers, correct]);
  const compat = useMemo(() => {
    if (!done || game !== 'compat') return null;
    const n = Object.keys(answers).length;
    const same = n; // recreativo: cada resposta registrada conta como ponto de diálogo
    const pct = Math.min(100, 40 + same * 12);
    return { pct, msg: compatibilityMessage(pct) };
  }, [done, game, answers]);

  if (!couple) return <Card><h2>Jogos 🎮</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  function reset() { setAnswers({}); setDone(false); setIdx(0); setPicked(''); }

  return (
    <div className="grid">
      <h1 style={{ margin: 0 }}>Jogos a dois 🎮</h1>
      <div className="grid cols3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => { setGame(g.id); reset(); }}
            style={{
              textAlign: 'left', cursor: 'pointer', borderRadius: 18, padding: 16,
              border: game === g.id ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: 'var(--card)', color: 'var(--text)',
            }}
          >
            <div style={{ fontSize: '1.8rem' }}>{g.icon}</div>
            <strong>{g.name}</strong>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{g.desc}</p>
          </button>
        ))}
      </div>

      {game === 'conhece' ? (
        <Card>
          <h3>🧠 Quanto você me conhece?</h3>
          <p className="muted">Regras: cada um responde sem olhar; depois comparem. Gabarito = a resposta do parceiro(a).</p>
          {!done ? KNOW_QUIZ.map((q) => (
            <fieldset key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 12, marginBottom: 10 }}>
              <legend><strong>{q.question}</strong></legend>
              {q.choices?.map((c) => (
                <label key={c} className="row" style={{ padding: '4px 0' }}>
                  <input type="radio" name={q.id} checked={answers[q.id] === c} onChange={() => setAnswers((a) => ({ ...a, [q.id]: c }))} /> {c}
                </label>
              ))}
            </fieldset>
          )) : null}
          {!done ? (
            <button className="btn" disabled={Object.keys(answers).length < KNOW_QUIZ.length} onClick={() => { setDone(true); pushNotification('jogo', 'Quiz concluído 🎮', 'Vocês terminaram o “Quanto você me conhece?”.'); }}>
              Ver resultado ({Object.keys(answers).length}/{KNOW_QUIZ.length})
            </button>
          ) : result ? (
            <div>
              <p style={{ fontSize: '1.3rem', fontWeight: 800 }}>{result.hits}/{result.total} — {result.percent}%</p>
              <p>{compatibilityMessage(result.percent)}</p>
              <button className="btn secondary" onClick={reset}>Jogar de novo</button>
            </div>
          ) : null}
        </Card>
      ) : null}

      {game === 'memorias' ? (
        <Card>
          <h3>💭 Perguntas sobre memórias</h3>
          <p style={{ fontSize: '1.15rem', fontWeight: 700 }} data-testid="memory-q">{[...MEMORY_QUESTIONS, ...customList][idx % [...MEMORY_QUESTIONS, ...customList].length]}</p>
          <div className="row">
            <button className="btn" onClick={() => setIdx((i) => i + 1)}>Próxima 💭</button>
          </div>
          <form className="row" style={{ marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); if (customQ.trim()) { setCustomList((l) => [...l, customQ.trim()]); setCustomQ(''); } }}>
            <input value={customQ} onChange={(e) => setCustomQ(e.target.value)} placeholder="Criar pergunta personalizada…" maxLength={140} aria-label="Pergunta personalizada" style={{ flex: 1, font: 'inherit', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }} />
            <button className="btn secondary small" type="submit">Adicionar</button>
          </form>
        </Card>
      ) : null}

      {game === 'provavel' ? (
        <Card>
          <h3>😄 Quem é mais provável?</h3>
          <p style={{ fontSize: '1.15rem', fontWeight: 700 }}>{MOST_LIKELY[idx % MOST_LIKELY.length]}</p>
          <div className="row">
            <button className="btn" onClick={() => setPicked(couple.nameA)}>👈 {couple.nameA}</button>
            <button className="btn secondary" onClick={() => setPicked(couple.nameB)}>{couple.nameB} 👉</button>
            <button className="btn ghost" onClick={() => { setIdx((i) => i + 1); setPicked(''); }}>Próxima</button>
          </div>
          {picked ? <p>Resposta: <strong>{picked}</strong> 😄 — discutam se concordam!</p> : null}
        </Card>
      ) : null}

      {game === 'verdade' ? (
        <Card>
          <h3>🌶️ Verdade ou desafio (leve)</h3>
          <div className="row">
            <button className="btn" onClick={() => { setPicked(`VERDADE: ${TRUTH_LIGHT[Math.floor(Math.random() * TRUTH_LIGHT.length)]}`); }}>Verdade 💬</button>
            <button className="btn secondary" onClick={() => { setPicked(`DESAFIO: ${DARE_LIGHT[Math.floor(Math.random() * DARE_LIGHT.length)]}`); }}>Desafio 🎯</button>
          </div>
          {picked ? <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{picked}</p> : <Empty icon="💕" title="Escolha verdade ou desafio" />}
        </Card>
      ) : null}

      {game === 'compat' ? (
        <Card>
          <h3>💖 Quiz de compatibilidade (recreativo)</h3>
          {!done ? COMPAT_QS.map((q) => (
            <fieldset key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 12, marginBottom: 10 }}>
              <legend><strong>{q.q}</strong></legend>
              {q.choices.map((c) => (
                <label key={c} className="row" style={{ padding: '4px 0' }}>
                  <input type="radio" name={q.id} checked={answers[q.id] === c} onChange={() => setAnswers((a) => ({ ...a, [q.id]: c }))} /> {c}
                </label>
              ))}
            </fieldset>
          )) : null}
          {!done ? (
            <button className="btn" disabled={Object.keys(answers).length < COMPAT_QS.length} onClick={() => setDone(true)}>Ver sintonia 💖</button>
          ) : compat ? (
            <div>
              <p style={{ fontSize: '1.3rem', fontWeight: 800 }}>{compat.pct}% de sintonia</p>
              <p>{compat.msg}</p>
              <button className="btn secondary" onClick={reset}>Jogar de novo</button>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
