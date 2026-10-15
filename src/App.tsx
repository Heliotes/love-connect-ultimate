// Love Connect Ultimate — rotas do app.
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './store/AppStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Chat from './pages/Chat';
import Gallery from './pages/Gallery';
import CalendarPage from './pages/CalendarPage';
import Counter from './pages/Counter';
import Games from './pages/Games';
import Wheel from './pages/Wheel';
import Wishlist from './pages/Wishlist';
import Movies from './pages/Movies';
import Diary from './pages/Diary';
import Letters from './pages/Letters';
import Mood from './pages/Mood';
import Music from './pages/Music';
import Expenses from './pages/Expenses';
import Notifications from './pages/Notifications';
import Extras from './pages/Extras';
import Settings from './pages/Settings';
import { Card } from './components/UI';

function NotFound() {
  return (
    <Card>
      <h2>Página não encontrada 🧭</h2>
      <p className="muted">Que tal voltar para o início?</p>
      <Link className="btn" to="/">Ir para o início 💗</Link>
    </Card>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entrar" element={<Auth />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/contador" element={<Counter />} />
            <Route path="/jogos" element={<Games />} />
            <Route path="/roleta" element={<Wheel />} />
            <Route path="/desejos" element={<Wishlist />} />
            <Route path="/filmes" element={<Movies />} />
            <Route path="/musica" element={<Music />} />
            <Route path="/diario" element={<Diary />} />
            <Route path="/cartas" element={<Letters />} />
            <Route path="/humor" element={<Mood />} />
            <Route path="/despesas" element={<Expenses />} />
            <Route path="/notificacoes" element={<Notifications />} />
            <Route path="/extras" element={<Extras />} />
            <Route path="/config" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}
