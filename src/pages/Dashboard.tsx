// Dashboard do casal: contadores, próximos eventos, memórias, pergunta do dia.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/AppStore';
import { daysTogether, nextAnniversary, todayISO, formatDateBR, daysBetween } from '../utils/dates';
import { DAILY_QUESTIONS, MESSAGES_OF_DAY } from '../data/seed';
import { Card, Avatar, Empty, Progress } from '../components/UI';
import { wishProgress } from '../utils/logic';

const SHORTCUTS = [
  { to: '/chat', icon: '💬', label: 'Chat' },
  { to: '/galeria', icon: '📸', label: 'Memórias' },
  { to: '/calendario', icon: '📅', label: 'Agenda' },
  { to: '/jogos', icon: '🎮', label: 'Jogos' },
  { to: '/roleta', icon: '🎡', label: 'Roleta' },
  { to: '/cartas', icon: '💌', label: 'Cartas' },
  { to: '/diario', icon: '📖', label: 'Diário' },
  { to: '/musica', icon: '🎵', label: 'Música' },
];

const ALL_CARDS = [
  { id: 'counter', label: 'Contador' },
  { id: 'events', label: 'Próximos eventos' },
  { id: 'memories', label: 'Últimas memórias' },
  { id: 'question', label: 'Pergunta do dia' },
  { id: 'shortcuts', label: 'Atalhos' },
  { id: 'wishlist', label: 'Desejos' },
];

export default function Dashboard() {
  const { user, couple, events, memories, wishlist, moods, updateCouple, prefs, setPrefs } = useStore();
  const [customize, setCustomize] = useState(false);

  const stats = useMemo(() => {
    if (!couple) return null;
    const days = daysTogether(couple.startDate);
    const ann = nextAnniversary(couple.startDate);
    const today = todayISO();
    const upcoming = events.filter((e) => e.date >= today).slice(0, 4);
    const dayNum = Number(today.slice(8, 10)) + Number(today.slice(5, 7)) * 31;
    const question = DAILY_QUESTIONS[dayNum % DAILY_QUESTIONS.length];
    const message = couple.messageOfDay || MESSAGES_OF_DAY[dayNum % MESSAGES_OF_DAY.length];
    const lastMoods = moods.slice(0, 2);
    return { days, ann, upcoming, question, message, lastMoods };
  }, [couple, events, moods]);

  const wish = useMemo(() => wishProgress(wishlist), [wishlist]);
  const visible = prefs.homeCards.length ? prefs.homeCards : ALL_CARDS.map((c) => c.id);

  if (!user) {
    return (
      <Card>
        <h2>Bem-vindo(a) ao Love Connect Ultimate 💗</h2>
        <p className="muted">Crie sua conta e monte o espaço privado do casal.</p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn" to="/entrar">Começar agora</Link>
        </div>
      </Card>
    );
  }

  if (!couple || !stats) {
    return (
      <Card>
        <h2>Falta pouco, {user.name.split(' ')[0]}! 💕</h2>
        <p className="muted">Crie o espaço do casal ou entre com o código de convite.</p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn" to="/entrar">Montar nosso espaço</Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid">
      <div className="hero">
        <span className="hearts" aria-hidden>💕</span>
        <h2>{couple.title}</h2>
        <p>{couple.nameA} 💗 {couple.nameB} · juntos desde {formatDateBR(couple.startDate)}</p>
        <p style={{ marginTop: 8, fontWeight: 700 }}>“{stats.message}”</p>
      </div>

      <div className="row">
        <div className="row">
          <Avatar src={couple.photoA} name={couple.nameA} />
          <strong>{couple.nameA}</strong>
          <span aria-hidden>💞</span>
          <Avatar src={couple.photoB} name={couple.nameB} />
          <strong>{couple.nameB}</strong>
        </div>
        <span className="spacer" />
        <button className="btn secondary small" onClick={() => setCustomize((v) => !v)}>🎨 Personalizar início</button>
      </div>

      {customize ? (
        <Card>
          <h3>Quais cartões mostrar?</h3>
          <div className="chiprow">
            {ALL_CARDS.map((c) => (
              <button
                key={c.id}
                className={`chip${visible.includes(c.id) ? ' on' : ''}`}
                onClick={() => {
                  const has = visible.includes(c.id);
                  setPrefs({ homeCards: has ? visible.filter((v) => v !== c.id) : [...visible, c.id] });
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Mensagem do dia personalizada
              <input
                value={couple.messageOfDay ?? ''}
                onChange={(e) => updateCouple({ messageOfDay: e.target.value })}
                placeholder="Deixe em branco para usar a sugestão diária"
                maxLength={140}
              />
            </label>
          </div>
        </Card>
      ) : null}

      {visible.includes('counter') ? (
        <div className="grid cols3">
          <Card><div className="kpi"><div className="n">{stats.days}</div><div className="l">dias juntos</div></div></Card>
          <Card><div className="kpi"><div className="n">{stats.ann.years} {stats.ann.years === 1 ? 'ano' : 'anos'}</div><div className="l">próximo aniversário em {stats.ann.daysLeft} dias · {formatDateBR(stats.ann.dateISO)}</div></div></Card>
          <Card><div className="kpi"><div className="n">{stats.lastMoods.length ? stats.lastMoods[0].mood : '💗'}</div><div className="l">humor recente do casal</div></div></Card>
        </div>
      ) : null}

      {visible.includes('shortcuts') ? (
        <Card>
          <h3>Atalhos</h3>
          <div className="chiprow">
            {SHORTCUTS.map((s) => (
              <Link key={s.to} className="chip" to={s.to}>{s.icon} {s.label}</Link>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid cols2">
        {visible.includes('events') ? (
          <Card>
            <h3>📅 Próximos eventos</h3>
            {stats.upcoming.length === 0 ? (
              <Empty icon="🗓️" title="Nenhum evento próximo" hint="Que tal planejar um encontro?" action={<Link className="btn small" to="/calendario">Abrir agenda</Link>} />
            ) : (
              stats.upcoming.map((e) => (
                <p key={e.id}>• <strong>{e.title}</strong> — {formatDateBR(e.date)}{e.time ? ` às ${e.time}` : ''} <span className="muted">({daysBetween(todayISO(), e.date)} dias)</span></p>
              ))
            )}
          </Card>
        ) : null}
        {visible.includes('memories') ? (
          <Card>
            <h3>📸 Últimas memórias</h3>
            {memories.length === 0 ? (
              <Empty icon="💭" title="Ainda sem memórias" hint="Registre a primeira foto do casal." action={<Link className="btn small" to="/galeria">Criar memória</Link>} />
            ) : (
              <div className="grid cols2">
                {memories.slice(0, 4).map((m) => (
                  <div key={m.id}>
                    {m.image ? <img src={m.image} alt={m.title} loading="lazy" /> : null}
                    <p><strong>{m.title}</strong><br /><span className="muted">{formatDateBR(m.date)}</span></p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}
      </div>

      <div className="grid cols2">
        {visible.includes('question') ? (
          <Card>
            <h3>💬 Pergunta do dia</h3>
            <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>{stats.question}</p>
            <div className="row" style={{ marginTop: 10 }}>
              <Link className="btn small" to="/chat">Conversar sobre isso</Link>
              <Link className="btn secondary small" to="/jogos">Responder jogando</Link>
            </div>
          </Card>
        ) : null}
        {visible.includes('wishlist') ? (
          <Card>
            <h3>🌟 Lista de desejos</h3>
            <p className="muted">{wish.done} de {wish.total} concluídos</p>
            <Progress percent={wish.percent} />
            <div className="row" style={{ marginTop: 10 }}>
              <Link className="btn small secondary" to="/desejos">Ver desejos</Link>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
