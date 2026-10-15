// Ajustes: perfil, casal/convite, aparência, dados (exportar), PWA, conta.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/AppStore';
import { Card, Field, fileToDataURL } from '../components/UI';

const ACCENTS = ['#c2255c', '#e64980', '#9c36b5', '#7048e8', '#d6336c', '#e67700', '#2b8a3e'];

export default function Settings() {
  const {
    user, couple, updateProfile, updateCouple, deleteAccount, logout, leaveCouple,
    prefs, setPrefs, exportData,
  } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? '');
  const [title, setTitle] = useState(couple?.title ?? '');
  const [nameA, setNameA] = useState(couple?.nameA ?? '');
  const [nameB, setNameB] = useState(couple?.nameB ?? '');
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!user) return <Card><h2>Ajustes ⚙️</h2><p className="muted">Entre para ajustar.</p></Card>;

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setMsg('Informe seu nome.'); return; }
    updateProfile({ name: name.trim() });
    setMsg('Perfil atualizado 💖');
  }

  function saveCouple(e: React.FormEvent) {
    e.preventDefault();
    updateCouple({ title: title.trim() || 'Nosso cantinho', nameA: nameA.trim(), nameB: nameB.trim() });
    setMsg('Espaço atualizado 💖');
  }

  return (
    <div className="grid">
      <h1 style={{ margin: 0 }}>Ajustes ⚙️</h1>
      {msg ? <p role="status" style={{ color: '#2e7d32', fontWeight: 700 }}>{msg}</p> : null}

      <Card>
        <h3>👤 Meu perfil</h3>
        <form onSubmit={saveProfile}>
          <Field label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></Field>
          <Field label="Foto de perfil">
            <input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) fileToDataURL(f, 200).then((url) => updateProfile({ photo: url })).catch(() => setMsg('Não foi possível ler a imagem.'));
            }} />
          </Field>
          <p className="muted" style={{ fontSize: '0.82rem' }}>Conta: {user.email}</p>
          <button className="btn small" type="submit">Salvar perfil</button>
        </form>
      </Card>

      {couple ? (
        <Card>
          <h3>💑 Nosso espaço</h3>
          <form onSubmit={saveCouple}>
            <Field label="Título do espaço"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} /></Field>
            <div className="grid cols2">
              <Field label="Nome 1"><input value={nameA} onChange={(e) => setNameA(e.target.value)} maxLength={40} /></Field>
              <Field label="Nome 2"><input value={nameB} onChange={(e) => setNameB(e.target.value)} maxLength={40} /></Field>
            </div>
            <div className="grid cols2">
              <Field label="Foto 1">
                <input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) fileToDataURL(f, 200).then((url) => updateCouple({ photoA: url })).catch(() => setMsg('Não foi possível ler a imagem.'));
                }} />
              </Field>
              <Field label="Foto 2">
                <input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) fileToDataURL(f, 200).then((url) => updateCouple({ photoB: url })).catch(() => setMsg('Não foi possível ler a imagem.'));
                }} />
              </Field>
            </div>
            <button className="btn small" type="submit">Salvar espaço</button>
          </form>
          <div className="row" style={{ marginTop: 12 }}>
            <span>Código de convite: <strong style={{ fontSize: '1.2rem' }}>{couple.code}</strong></span>
            <button className="btn secondary small" onClick={() => { navigator.clipboard?.writeText(couple.code).then(() => setCopied(true)).catch(() => setCopied(false)); }}>
              {copied ? 'Copiado ✓' : 'Copiar'}
            </button>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn ghost small" onClick={() => { if (confirm('Sair deste espaço? Seus dados locais do casal permanecem no aparelho.')) { leaveCouple(); navigate('/entrar'); } }}>Sair do espaço</button>
          </div>
        </Card>
      ) : null}

      <Card>
        <h3>🎨 Aparência</h3>
        <div className="chiprow">
          {(['light', 'dark', 'auto'] as const).map((t) => (
            <button key={t} className={`chip${prefs.theme === t ? ' on' : ''}`} onClick={() => setPrefs({ theme: t })}>
              {t === 'light' ? '☀️ Claro' : t === 'dark' ? '🌙 Escuro' : '✨ Automático'}
            </button>
          ))}
        </div>
        <p style={{ fontWeight: 700, marginTop: 12 }}>Cor de destaque</p>
        <div className="row">
          {ACCENTS.map((c) => (
            <button key={c} onClick={() => setPrefs({ accent: c })} aria-label={`Cor ${c}`} style={{ width: 36, height: 36, borderRadius: '50%', background: c, border: prefs.accent === c ? '3px solid var(--text)' : '2px solid var(--border)', cursor: 'pointer' }} />
          ))}
        </div>
      </Card>

      <Card>
        <h3>💾 Meus dados</h3>
        <p className="muted">Exporte um backup JSON de tudo que está neste dispositivo.</p>
        <div className="row">
          <button className="btn secondary small" onClick={exportData}>Exportar backup ⬇</button>
        </div>
      </Card>

      <Card>
        <h3>📲 Instalar como app (PWA)</h3>
        <p className="muted">No Android/Chrome: menu ⋮ → “Instalar app” / “Adicionar à tela inicial”. No iPhone/Safari: Compartilhar → “Adicionar à Tela de Início”. Funciona offline após a primeira visita.</p>
      </Card>

      <Card>
        <h3>🚪 Conta</h3>
        <div className="row">
          <button className="btn secondary small" onClick={() => { logout(); navigate('/entrar'); }}>Sair</button>
          <button className="btn danger small" onClick={() => { if (confirm('Encerrar sua conta? Isso apaga seu usuário deste dispositivo.')) { deleteAccount(); navigate('/entrar'); } }}>Encerrar conta</button>
        </div>
      </Card>
    </div>
  );
}
