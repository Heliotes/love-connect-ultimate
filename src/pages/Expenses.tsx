// Despesas compartilhadas: registro, divisão, resumo mensal, gráfico simples.
import { useMemo, useState } from 'react';
import { useStore } from '../store/AppStore';
import { EXPENSE_CATEGORIES } from '../data/seed';
import { toCents, formatBRL } from '../utils/validation';
import { expenseSummary } from '../utils/logic';
import { Card, Empty, Modal, Field } from '../components/UI';

export default function Expenses() {
  const { couple, users, expenses, saveExpense, deleteExpense } = useStore();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [split, setSplit] = useState<'equal' | 'mine'>('equal');
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [err, setErr] = useState('');

  const monthItems = useMemo(() => expenses.filter((e) => e.date.startsWith(month)), [expenses, month]);
  const summary = useMemo(() => expenseSummary(monthItems), [monthItems]);
  const byCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthItems) map.set(e.category, (map.get(e.category) ?? 0) + e.amountCents);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthItems]);
  const maxCat = byCat.length ? byCat[0][1] : 1;

  if (!couple) return <Card><h2>Contas 💰</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name.split(' ')[0] ?? '—';
  const payer = users.find((u) => couple.memberIds.includes(u.id)) ?? users[0];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cents = toCents(amount);
    if (cents == null || cents <= 0) { setErr('Informe um valor válido (ex.: 59,90).'); return; }
    if (!payer) { setErr('Cadastre os parceiros primeiro.'); return; }
    saveExpense({ paidById: payer.id, amountCents: cents, category, note: note.trim() || undefined, date, split });
    setAmount(''); setNote(''); setErr(''); setOpen(false);
  }

  const ids = Object.keys(summary.balanceCents);

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Contas a dois 💰</h1>
        <button className="btn" onClick={() => setOpen(true)}>+ Despesa</button>
      </div>
      <Card>
        <div className="row">
          <label>Mês <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Mês do resumo" /></label>
          <span className="spacer" />
          <strong>Total: {formatBRL(summary.totalCents)}</strong>
        </div>
        {ids.length >= 2 ? (
          <p>
            {nameOf(ids[0])}: {summary.balanceCents[ids[0]] >= 0 ? 'tem a receber' : 'deve'} <strong>{formatBRL(Math.abs(summary.balanceCents[ids[0]]))}</strong>
            {' '}· {nameOf(ids[1])}: {summary.balanceCents[ids[1]] >= 0 ? 'tem a receber' : 'deve'} <strong>{formatBRL(Math.abs(summary.balanceCents[ids[1]]))}</strong>
          </p>
        ) : (
          <p className="muted">O acerto entre os dois aparece aqui quando houver gastos dos dois perfis.</p>
        )}
        <h3 style={{ marginTop: 12 }}>Por categoria</h3>
        {byCat.length === 0 ? <p className="muted">Sem gastos neste mês.</p> : byCat.map(([c, v]) => (
          <div key={c} style={{ marginBottom: 6 }}>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>{c}</span><strong>{formatBRL(v)}</strong>
            </div>
            <div className="progress"><div style={{ width: `${Math.round((v / maxCat) * 100)}%` }} /></div>
          </div>
        ))}
        <p className="muted" style={{ fontSize: '0.78rem' }}>Sem integração bancária: registre manualmente. 🔒</p>
      </Card>

      {monthItems.length === 0 ? (
        <Empty icon="🧾" title="Nenhuma despesa no mês" hint="Registre o primeiro gasto compartilhado." />
      ) : monthItems.map((e) => (
        <Card key={e.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>{formatBRL(e.amountCents)} · {e.category}</strong>
            <span className="badge">{e.split === 'equal' ? 'meio a meio' : 'pagou tudo'}</span>
          </div>
          <p className="muted" style={{ fontSize: '0.82rem' }}>{e.date.split('-').reverse().join('/')} · pago por {nameOf(e.paidById)}{e.note ? ` · ${e.note}` : ''}</p>
          <button className="btn ghost small" onClick={() => { if (confirm('Apagar esta despesa?')) deleteExpense(e.id); }}>Apagar</button>
        </Card>
      ))}

      {open ? (
        <Modal title="Nova despesa" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <Field label="Valor (R$)"><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="59,90" inputMode="decimal" /></Field>
            <div className="grid cols2">
              <Field label="Categoria">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>{EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
              </Field>
              <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Field>
            </div>
            <Field label="Divisão">
              <select value={split} onChange={(e) => setSplit(e.target.value as 'equal' | 'mine')}>
                <option value="equal">⚖️ Meio a meio</option>
                <option value="mine">💝 Quem pagou cobre tudo</option>
              </select>
            </Field>
            <Field label="Nota (opcional)"><input value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} /></Field>
            {err ? <p role="alert" style={{ color: '#c92a2a' }}>{err}</p> : null}
            <div className="row">
              <button className="btn" type="submit">Salvar 💰</button>
              <button className="btn secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
