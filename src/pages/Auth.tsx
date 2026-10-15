// Cadastro, login, recuperação de senha e espaço do casal (código de convite).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/AppStore';
import { isEmail, passwordValid, required } from '../utils/validation';
import { todayISO } from '../utils/dates';
import { Card, Field } from '../components/UI';

export default function Auth() {
  const { user, couple, register, login, requestReset, confirmReset, createCouple, joinCouple, logout } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'reset' | 'space'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('Nosso cantinho');
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setInfo(''); setBusy(true);
    try {
      if (mode === 'register') {
        if (!required(name)) { setErr('Informe seu nome.'); return; }
        if (!isEmail(email)) { setErr('E-mail inválido.'); return; }
        if (!passwordValid(password)) { setErr('Senha com no mínimo 6 caracteres.'); return; }
        const problem = await register({ name, email, password });
        if (problem) { setErr(problem); return; }
        setMode('space');
      } else if (mode === 'login') {
        if (!isEmail(email)) { setErr('E-mail inválido.'); return; }
        if (!required(password)) { setErr('Informe a senha.'); return; }
        const problem = await login(email, password);
        if (problem) { setErr(problem); return; }
        setMode('space');
      } else if (mode === 'reset') {
        if (token) {
          if (!passwordValid(password)) { setErr('Nova senha com no mínimo 6 caracteres.'); return; }
          const problem = await confirmReset(token, password);
          if (problem) { setErr(problem); return; }
          setInfo('Senha alterada! Faça login.');
          setMode('login');
        } else {
          if (!isEmail(email)) { setErr('Informe o e-mail da conta.'); return; }
          const t = requestReset(email);
          if (t) setInfo(`Código de recuperação (válido por 30 min): ${t}`);
          else setInfo('Se o e-mail existir, um código foi gerado.');
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function makeSpace(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const problem = createCouple({ title, nameA: nameA || user?.name || '', nameB, startDate });
    if (problem) { setErr(problem); return; }
    navigate('/');
  }

  function join(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const problem = joinCouple(code);
    if (problem) { setErr(problem); return; }
    navigate('/');
  }

  if (user && couple) {
    return (
      <Card>
        <h2>Você já está conectado(a) 💗</h2>
        <p className="muted">Espaço atual: <strong>{couple.title}</strong> · código <strong>{couple.code}</strong></p>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => navigate('/')}>Ir para o início</button>
          <button className="btn secondary" onClick={logout}>Sair</button>
        </div>
      </Card>
    );
  }

  if (user && (mode === 'space' || mode === 'login' || mode === 'register')) {
    return (
      <div className="grid cols2">
        <Card>
          <h2>Criar nosso espaço 💕</h2>
          <form onSubmit={makeSpace}>
            <Field label="Nome do espaço"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} /></Field>
            <Field label="Seu nome no casal"><input value={nameA} onChange={(e) => setNameA(e.target.value)} placeholder={user.name} maxLength={40} /></Field>
            <Field label="Nome do amor"><input value={nameB} onChange={(e) => setNameB(e.target.value)} placeholder="Ex.: Maria" maxLength={40} required /></Field>
            <Field label="Data de início"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></Field>
            {err ? <p className="err" role="alert" style={{ color: '#c92a2a' }}>{err}</p> : null}
            <button className="btn" type="submit">Criar espaço</button>
          </form>
        </Card>
        <Card>
          <h2>Entrar com código 💌</h2>
          <p className="muted">Peça o código de 6 letras ao seu amor.</p>
          <form onSubmit={join}>
            <Field label="Código do convite">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} style={{ textTransform: 'uppercase' }} />
            </Field>
            {err ? <p role="alert" style={{ color: '#c92a2a' }}>{err}</p> : null}
            <button className="btn secondary" type="submit">Entrar no espaço</button>
          </form>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn ghost" onClick={logout}>Trocar de conta</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="logo-big" aria-hidden>💗</div>
      <h1 style={{ textAlign: 'center' }}>Love Connect Ultimate</h1>
      <p className="muted" style={{ textAlign: 'center' }}>O cantinho privado do casal.</p>
      <Card>
        <div className="chiprow" role="tablist" aria-label="Modo de acesso">
          {(['login', 'register', 'reset'] as const).map((m) => (
            <button key={m} className={`chip${mode === m ? ' on' : ''}`} onClick={() => { setMode(m); setErr(''); setInfo(''); }}>
              {m === 'login' ? 'Entrar' : m === 'register' ? 'Cadastrar' : 'Recuperar'}
            </button>
          ))}
        </div>
        <form onSubmit={submit} style={{ marginTop: 14 }}>
          {mode === 'register' ? (
            <Field label="Seu nome"><input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" /></Field>
          ) : null}
          <Field label="E-mail"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
          {mode === 'reset' ? (
            <Field label="Código recebido (se já pediu)"><input value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} placeholder="Opcional" /></Field>
          ) : null}
          {mode !== 'reset' || token ? (
            <Field label={mode === 'reset' ? 'Nova senha' : 'Senha'}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            </Field>
          ) : null}
          {err ? <p role="alert" style={{ color: '#c92a2a' }}>{err}</p> : null}
          {info ? <p role="status" style={{ color: '#2e7d32', fontWeight: 700 }}>{info}</p> : null}
          <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar 💕' : mode === 'register' ? 'Criar conta 💖' : token ? 'Trocar senha' : 'Enviar código'}
          </button>
        </form>
        <p className="muted" style={{ fontSize: '0.78rem', marginTop: 10 }}>
          Versão local: os dados ficam neste dispositivo. Para sincronizar entre celulares, configure o backend (veja o README).
        </p>
      </Card>
    </div>
  );
}
