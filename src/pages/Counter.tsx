// Contador do relacionamento: dias juntos, aniversários, contagem regressiva.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { daysTogether, nextAnniversary, countdown, formatDateBR, todayISO } from '../utils/dates';
import { Card } from '../components/UI';

export default function Counter() {
  const { couple, updateCouple } = useStore();
  const [target, setTarget] = useState('');
  const [editStart, setEditStart] = useState(false);
  const [newStart, setNewStart] = useState('');

  const info = useMemo(() => {
    if (!couple) return null;
    const days = daysTogether(couple.startDate);
    const ann = nextAnniversary(couple.startDate);
    const cd = target ? countdown(target) : null;
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    return { days, ann, cd, weeks, months };
  }, [couple, target]);

  if (!couple || !info) return <Card><h2>Contador ⏳</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  return (
    <div className="grid">
      <h1 style={{ margin: 0 }}>Nosso tempo juntos ⏳</h1>
      <div className="grid cols3">
        <Card><div className="kpi"><div className="n">{info.days}</div><div className="l">dias juntos 💗</div></div></Card>
        <Card><div className="kpi"><div className="n">{info.weeks}</div><div className="l">semanas de história</div></div></Card>
        <Card><div className="kpi"><div className="n">~{info.months}</div><div className="l">meses de amor</div></div></Card>
      </div>

      <Card>
        <h3>🎂 Próximo aniversário</h3>
        <p>Faltam <strong>{info.ann.daysLeft} dias</strong> para {info.ann.years} {info.ann.years === 1 ? 'ano' : 'anos'} juntos — {formatDateBR(info.ann.dateISO)}.</p>
        <p className="muted">Início: {formatDateBR(couple.startDate)} {!editStart ? <button className="btn ghost small" onClick={() => { setNewStart(couple.startDate); setEditStart(true); }}>ajustar</button> : null}</p>
        {editStart ? (
          <form className="row" onSubmit={(e) => { e.preventDefault(); if (newStart) updateCouple({ startDate: newStart }); setEditStart(false); }}>
            <input type="date" value={newStart} max={todayISO()} onChange={(e) => setNewStart(e.target.value)} aria-label="Data de início" />
            <button className="btn small" type="submit">Salvar</button>
            <button className="btn secondary small" type="button" onClick={() => setEditStart(false)}>Cancelar</button>
          </form>
        ) : null}
      </Card>

      <Card>
        <h3>⏱ Contagem regressiva personalizada</h3>
        <p className="muted">Ex.: próxima viagem, aniversário, encontro especial.</p>
        <div className="row">
          <input type="date" value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Data alvo" style={{ font: 'inherit', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }} />
          {target ? <button className="btn secondary small" onClick={() => setTarget('')}>Limpar</button> : null}
        </div>
        {info.cd ? (
          info.cd.passed ? (
            <p>🎉 Essa data já chegou! Que tal registrar uma memória?</p>
          ) : (
            <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>Faltam {info.cd.days} dias, {info.cd.hours}h e {info.cd.minutes}min 💖</p>
          )
        ) : null}
      </Card>
    </div>
  );
}
