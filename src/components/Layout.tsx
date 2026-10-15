// Layout responsivo: sidebar no desktop, navegação inferior no mobile.
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/AppStore';

const LINKS = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/chat', label: 'Chat', icon: '💬' },
  { to: '/galeria', label: 'Memórias', icon: '📸' },
  { to: '/calendario', label: 'Agenda', icon: '📅' },
  { to: '/contador', label: 'Contador', icon: '⏳' },
  { to: '/jogos', label: 'Jogos', icon: '🎮' },
  { to: '/roleta', label: 'Roleta', icon: '🎡' },
  { to: '/desejos', label: 'Desejos', icon: '🌟' },
  { to: '/filmes', label: 'Filmes', icon: '🎬' },
  { to: '/diario', label: 'Diário', icon: '📖' },
  { to: '/cartas', label: 'Cartas', icon: '💌' },
  { to: '/humor', label: 'Humor', icon: '💗' },
  { to: '/musica', label: 'Música', icon: '🎵' },
  { to: '/despesas', label: 'Contas', icon: '💰' },
  { to: '/notificacoes', label: 'Avisos', icon: '🔔' },
  { to: '/extras', label: 'Extras', icon: '🎁' },
  { to: '/config', label: 'Ajustes', icon: '⚙️' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, couple, unreadCount, prefs, setPrefs } = useStore();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setPrefs({ theme: next });
  };

  return (
    <div className="shell">
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="brand"><span className="heart" aria-hidden>💗</span> Love Connect</div>
        {couple ? <p className="muted" style={{ fontSize: '0.82rem' }}>{couple.title}</p> : null}
        <nav className="nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span aria-hidden>{l.icon}</span> {l.label}
              {l.to === '/notificacoes' && unreadCount > 0 ? <span className="badge">{unreadCount}</span> : null}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <div className="topbar">
          <div className="brand" style={{ display: 'none' }} />
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            {user ? `Olá, ${user.name.split(' ')[0]} 💕` : 'Bem-vindo(a) 💕'}
          </span>
          <span className="spacer" />
          <button className="btn secondary small" onClick={toggleTheme} aria-label="Alternar tema">
            {prefs.theme === 'dark' || document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn secondary small" onClick={() => navigate('/notificacoes')} aria-label={`Notificações (${unreadCount} não lidas)`}>
            🔔 {unreadCount > 0 ? unreadCount : ''}
          </button>
          <button className="btn secondary small" onClick={() => navigate('/extras')} aria-label="Busca global">🔎</button>
        </div>
        <main id="conteudo">{children}</main>
      </div>
      <div className="bottomnav">
        <nav aria-label="Navegação móvel">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="ico" aria-hidden>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
