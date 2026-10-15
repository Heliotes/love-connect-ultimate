// Notificações: avisos, lembretes de eventos, cartas disponíveis, preferências.
import { useMemo } from 'react';
import { useStore } from '../store/AppStore';
import { todayISO, daysBetween, formatDateBR } from '../utils/dates';
import { letterEffectiveStatus } from '../utils/logic';
import { Card, Empty } from '../components/UI';

export default function Notifications() {
  const { couple, notifications, markRead, markAllRead, events, letters } = useStore();

  const derived = useMemo(() => {
    const out: { id: string; title: string; body: string }[] = [];
    if (!couple) return out;
    const today = todayISO();
    for (const e of events) {
      const diff = daysBetween(today, e.date);
      if (diff >= 0 && diff <= e.reminderDays) {
        out.push({ id: `evt-${e.id}`, title: `⏰ ${e.title} chegando!`, body: `${formatDateBR(e.date)} (faltam ${diff} dias)` });
      }
    }
    for (const l of letters) {
      if (letterEffectiveStatus(l) === 'entregue' && l.status === 'programada') {
        out.push({ id: `ltr-${l.id}`, title: '💌 Carta disponível!', body: `“${l.title}” pode ser lida agora.` });
      }
    }
    return out;
  }, [couple, events, letters]);

  if (!couple) return <Card><h2>Avisos 🔔</h2><p className="muted">Monte o espaço do casal primeiro.</p></Card>;

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Avisos 🔔</h1>
        {notifications.some((n) => !n.read) ? <button className="btn secondary small" onClick={markAllRead}>Marcar todas como lidas</button> : null}
      </div>

      {derived.length > 0 ? (
        <Card>
          <h3>📌 Lembretes automáticos</h3>
          {derived.map((d) => <p key={d.id}>• <strong>{d.title}</strong> <span className="muted">{d.body}</span></p>)}
        </Card>
      ) : null}

      {notifications.length === 0 ? (
        <Empty icon="🔕" title="Tudo em paz por aqui" hint="Novidades do casal aparecem neste cantinho." />
      ) : (
        <Card>
          {notifications.map((n) => (
            <div key={n.id} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '10px 0', opacity: n.read ? 0.65 : 1 }}>
              <div>
                <strong>{n.read ? '' : '● '}{n.title}</strong>
                <p className="muted" style={{ margin: 0 }}>{n.body}</p>
              </div>
              {!n.read ? <button className="btn secondary small" onClick={() => markRead(n.id)}>Lida ✓</button> : null}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
