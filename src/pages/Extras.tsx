// Extras: busca global, pergunta/desafio, presentes, temporizador, resumo, favoritos.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/AppStore';
import { DAILY_QUESTIONS, DARE_LIGHT, GIFT_IDEAS } from '../data/seed';
import { formatDateBR, todayISO } from '../utils/dates';
import { Card, Empty } from '../components/UI';

function weekNumber(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - start.getTime()) / (7 * 86_400_000));
}

export default function Extras() {
  const { couple, messages, memories, events, wishlist, movies, diary, letters, tracks } = useStore();
  const [q, setQ] = useState('');
  const [secs, setSecs] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  const [inputMin, setInputMin] = useState('15');

  useEffect(() => {
    if (!running) return;
    if (secs <= 0) { setRunning(false); return; }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, secs]);

  const today = todayISO();
  const daySeed = Number(today.slice(8, 10)) + Number(today.slice(5, 7)) * 31;
  const question = DAILY_QUESTIONS[daySeed % DAILY_QUESTIONS.length];
  const challenge = DARE_LIGHT[weekNumber() % DARE_LIGHT.length];

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle || !couple) return null;
    const has = (s: string) => s.toLowerCase().includes(needle);
    return {
      messages: messages.filter((m) => has(m.text)).slice(0, 5),
      memories: memories.filter((m) => has(`${m.title} ${m.caption}`)).slice(0, 5),
      events: events.filter((e) => has(e.title)).slice(0, 5),
      wishlist: wishlist.filter((w) => has(w.title)).slice(0, 5),
      movies: movies.filter((m) => has(m.title)).slice(0, 5),
      diary: diary.filter((d) => has(`${d.title} ${d.body}`)).slice(0, 5),
      letters: letters.filter((l) => has(`${l.title} ${l.body}`)).slice(0, 5),
      tracks: tracks.filter((t) => has(`${t.title} ${t.artist}`)).slice(0, 5),
    };
  }, [q, couple, messages, memories, events, wishlist, movies, diary, letters, tracks]);

  const monthPrefix = today.slice(0, 7);
  const summary = useMemo(() => (couple ? {
    memorias: memories.filter((m) => m.date.startsWith(monthPrefix)).length,
    eventos: events.filter((e) => e.date.startsWith(monthPrefix)).length,
    mensagens: messages.filter((m) => new Date(m.createdAt).toISOString().startsWith(monthPrefix)).length,
    desejosOk: wishlist.filter((w) => w.done).length,
    filmesOk: movies.filter((m) => m.status === 'assistido').length,
  } : null), [couple, memories, events, messages, wishlist, movies, monthPrefix]);

  const yearPrefix = today.slice(0, 4);
  const best = useMemo(() => (couple ? [
    ...memories.filter((m) => m.favorite && m.date.startsWith(yearPrefix)).map((m) => ({ icon: '📸', text: `${m.title} (${formatDateBR(m.date)})` })),
    ...diary.filter((d) => d.favorite && d.date.startsWith(yearPrefix)).map((d) => ({ icon: '📖', text: d.title })),
    ...tracks.filter((t) => t.favorite).map((t) => ({ icon: '🎵', text: `${t.title} — ${t.artist}` })),
  ].slice(0, 12) : []), [couple, memories, diary, tracks, yearPrefix]);

  if (!couple) return <Card><h2>Extras 🎁</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div className="grid">
      <h1 style={{ margin: 0 }}>Extras 🎁</h1>

      <Card>
        <h3>🔎 Pesquisa global</h3>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar em tudo: mensagens, memórias, filmes…" aria-label="Pesquisa global" style={{ width: '100%', font: 'inherit', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }} />
        {results ? (
          <div style={{ marginTop: 8 }}>
            {Object.entries(results).map(([k, items]) => (
              <p key={k}>• <strong>{k}</strong>: {items.length ? items.map((i, ix) => <span key={ix}>“{(i as { title?: string; text?: string }).title ?? (i as { text?: string }).text?.slice(0, 40)}” </span>) : <span className="muted">nada</span>}</p>
            ))}
          </div>
        ) : <p className="muted">Digite para pesquisar em todos os módulos.</p>}
      </Card>

      <div className="grid cols2">
        <Card>
          <h3>💬 Pergunta do dia</h3>
          <p style={{ fontWeight: 700 }}>{question}</p>
          <Link className="btn small" to="/chat">Conversar 💕</Link>
        </Card>
        <Card>
          <h3>🎯 Desafio semanal</h3>
          <p style={{ fontWeight: 700 }}>{challenge}</p>
          <p className="muted">Novo desafio toda semana 🌱</p>
        </Card>
      </div>

      <Card>
        <h3>🎁 Sugestões de presentes</h3>
        <div className="grid cols2">
          {GIFT_IDEAS.map((g) => <p key={g.title}>• <strong>{g.title}</strong> <span className="muted">— {g.detail}</span></p>)}
        </div>
      </Card>

      <div className="grid cols2">
        <Card>
          <h3>⏱ Temporizador do encontro</h3>
          <p style={{ fontSize: '2rem', fontWeight: 900 }} aria-live="polite">{mm}:{ss}</p>
          {secs === 0 ? <p>🎉 Tempo esgotado! Aproveitem o momento 💖</p> : null}
          <div className="row">
            <input value={inputMin} onChange={(e) => setInputMin(e.target.value)} aria-label="Minutos" inputMode="numeric" style={{ width: 70, font: 'inherit', padding: 8, borderRadius: 10 }} />
            <button className="btn secondary small" onClick={() => setSecs(Math.max(1, Number(inputMin) || 1) * 60)}>Definir</button>
            <button className="btn small" onClick={() => setRunning((r) => !r)}>{running ? 'Pausar' : 'Iniciar'}</button>
            <button className="btn ghost small" onClick={() => { setRunning(false); setSecs(15 * 60); }}>Zerar</button>
          </div>
        </Card>
        <Card>
          <h3>📊 Resumo do mês</h3>
          {summary ? (
            <>
              <p>📸 {summary.memorias} memórias · 📅 {summary.eventos} eventos · 💬 {summary.mensagens} mensagens</p>
              <p>🌟 {summary.desejosOk} desejos realizados · 🎬 {summary.filmesOk} filmes assistidos</p>
            </>
          ) : <Empty icon="📊" title="Sem dados" />}
        </Card>
      </div>

      <Card>
        <h3>🏆 Melhores momentos do ano</h3>
        {best.length === 0 ? <p className="muted">Marquem favoritos nas memórias, diário e músicas para ver aqui. ✨</p> : best.map((b, i) => <p key={i}>{b.icon} {b.text}</p>)}
      </Card>
    </div>
  );
}
