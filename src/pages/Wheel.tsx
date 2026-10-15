// Roleta de encontros: sorteio real com animação e gerenciamento de opções.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { DEFAULT_WHEEL_OPTIONS, WHEEL_CATEGORIES } from '../data/seed';
import { drawWheel, filterWheel } from '../utils/logic';
import { Card, Empty } from '../components/UI';

export default function Wheel() {
  const { couple, wheel, addWheel, deleteWheel, resetWheel, pushNotification } = useStore();
  const [cat, setCat] = useState('Todas');
  const [label, setLabel] = useState('');
  const [newCat, setNewCat] = useState<string>(WHEEL_CATEGORIES[0]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const options = useMemo(() => filterWheel(wheel, cat), [wheel, cat]);

  if (!couple) return <Card><h2>Roleta 🎡</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  function spin() {
    if (options.length === 0 || spinning) return;
    setSpinning(true);
    setResult(null);
    const ticks = 12;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setResult(options[Math.floor(Math.random() * options.length)].label);
      if (i >= ticks) {
        clearInterval(timer);
        const winner = drawWheel(options);
        setResult(winner ? winner.label : null);
        setSpinning(false);
        if (winner) pushNotification('roleta', 'Roleta decidiu! 🎡', winner.label);
      }
    }, 90);
  }

  return (
    <div className="grid">
      <h1 style={{ margin: 0 }}>Roleta de encontros 🎡</h1>
      <Card>
        <div className="wheel-visual" aria-live="polite">
          <span className={spinning ? 'spin' : ''} aria-hidden>🎡</span>
        </div>
        {result ? (
          <p style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 900 }}>✨ {result} ✨</p>
        ) : (
          <p className="muted" style={{ textAlign: 'center' }}>Gire e deixe o destino decidir 💕</p>
        )}
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={spin} disabled={spinning || options.length === 0}>
            {spinning ? 'Girando…' : 'Girar 🎡'}
          </button>
        </div>
        <div className="chiprow" style={{ justifyContent: 'center', marginTop: 10 }}>
          {['Todas', ...WHEEL_CATEGORIES].map((c) => (
            <button key={c} className={`chip${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </Card>

      <Card>
        <h3>Gerenciar opções ({options.length})</h3>
        <form className="row" onSubmit={(e) => { e.preventDefault(); if (label.trim()) { addWheel(label, newCat); setLabel(''); } }}>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nova ideia… Ex.: cinema + fondue" maxLength={80} aria-label="Nova opção" style={{ flex: 1, font: 'inherit', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }} />
          <select value={newCat} onChange={(e) => setNewCat(e.target.value)} aria-label="Categoria" style={{ font: 'inherit', padding: '10px', borderRadius: 12 }}>
            {WHEEL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn small" type="submit">Adicionar</button>
        </form>
        {wheel.length === 0 ? (
          <Empty icon="🎡" title="Roleta vazia" hint="Restaure as ideias ou crie as suas." action={<button className="btn small" onClick={() => resetWheel(DEFAULT_WHEEL_OPTIONS)}>Restaurar ideias 🎡</button>} />
        ) : (
          <>
            {options.map((o) => (
              <div key={o.id} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '6px 0' }}>
                <span>• {o.label} <span className="badge">{o.category}</span></span>
                <button className="btn ghost small" onClick={() => deleteWheel(o.id)}>Remover</button>
              </div>
            ))}
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn secondary small" onClick={() => resetWheel(DEFAULT_WHEEL_OPTIONS)}>Restaurar padrão</button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
