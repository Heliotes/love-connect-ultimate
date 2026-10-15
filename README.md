# 💗 Love Connect Ultimate

O app privado do casal: chat, memórias, agenda, contador, jogos, roleta de encontros,
desejos, filmes, diário, cartas programadas, humor, playlist, despesas, notificações e extras —
com visual romântico premium, modo claro/escuro e PWA instalável.

## ✨ Funcionalidades

- **Dashboard**: perfis, fotos, dias juntos, próximos eventos, memórias, pergunta do dia, atalhos, personalização da home
- **Conta**: cadastro, login, logout, recuperação por código, perfil, encerrar conta
- **Espaço do casal**: criação + convite por código de 6 letras (isolamento total por `coupleId`)
- **Chat**: texto, imagens, reações, respostas, anti-duplicadas (`clientKey`), histórico persistente
- **Galeria**: fotos (compressão local), álbuns, legendas, favoritos, busca, linha do tempo, ampliar, excluir com confirmação
- **Calendário**: mensal/destaques, categorias, lembretes, CRUD completo
- **Contador**: dias/semanas/meses, próximo aniversário (trata 29/02), contagem regressiva
- **Jogos reais**: Quanto você me conhece? (gabarito + placar), memórias, quem é mais provável, verdade/desafio leve, compatibilidade recreativa, perguntas personalizadas
- **Roleta**: sorteio real animado, 9 categorias, opções personalizadas, restaurar padrão
- **Desejos**: categorias, prioridades, metas, progresso, filtros
- **Filmes/séries**: status, gêneros, notas individuais, comentários, busca
- **Diário**: entradas com foto, favoritos, edição
- **Cartas**: rascunhos, capa, programadas com `datetime-local` (fuso local respeitado), leitura
- **Humor**: 8 emojis, nota opcional, registros privados 🔒, sugestões de atividade
- **Música**: playlist, links externos, favoritas, memória associada
- **Despesas**: registro, meio-a-meio ou pagou-tudo, resumo mensal, gráfico por categoria, acerto entre os dois
- **Notificações**: lembretes de eventos, cartas disponíveis, atividades, marcar como lida
- **Extras**: busca global, pergunta do dia, desafio semanal, presentes, temporizador, resumo mensal, melhores do ano, PWA
- **Ajustes**: perfil, fotos, cores, tema, exportar backup JSON, sair/encerrar

## 🛠 Tecnologias

React 19 + TypeScript estrito + Vite 8 + React Router (HashRouter) + CSS próprio (sem framework pesado) + Vitest + oxlint. Persistência local em `localStorage` (chaves `lcu_*`).

## 🚀 Como executar

```bash
cd love-connect-ultimate
npm install
npm run dev      # http://localhost:5173
```

## ✅ Verificações e testes

```bash
npm test         # Vitest: datas, validação, regras de negócio, storage
npm run build    # tsc -b + vite build (gera dist/)
npm run lint     # oxlint
```

Cobertura dos testes: viradas de mês/ano, ano bissexto (inclui 29/02 e século 1900/2000),
contagem regressiva, placar de quiz, sorteio da roleta, acerto de despesas, entrega de cartas,
validação de formulários, storage seguro e formato de convites.

## 📦 Build de produção

```bash
npm run build
# sirva a pasta dist/ em qualquer hospedagem estática
npx vite preview
```

## 🔐 Segurança e limitações honestas

- **Versão local (padrão)**: senhas com SHA-256+salt no `localStorage`. É uma DEMO funcional —
  qualquer pessoa com acesso ao aparelho pode ler os dados. **Não é autenticação segura de produção.**
- **Sem sincronização entre celulares** no modo local. Para sincronizar, use o backend opcional abaixo.
- Isolamento entre casais garantido por filtro de `coupleId` em todas as leituras/escritas.
- Nenhum segredo no código. Imagens ficam como dataURL local (cuidado com o limite ~5 MB do navegador).

## ☁️ Backend opcional (Supabase)

1. Crie um projeto em `supabase.com` (gratuito).
2. Crie as tabelas espelhando `src/types.ts` (users → use `auth.users` + perfis; couples, messages, memories, events, wishlist, movies, diary, letters, moods, tracks, expenses, notifications) com RLS por `couple_id`.
3. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. Substitua a camada `src/store/AppStore.tsx` + `src/utils/storage.ts` pelo cliente Supabase (mantendo as mesmas interfaces). Ative Auth por e-mail.

## 📲 Publicar / instalar

- **Web**: `npm run build` → publique `dist/` (Netlify, Vercel, GitHub Pages, etc.).
- **Celular (PWA)**: acesse a URL publicada → Chrome ⋮ → “Instalar app”; iPhone: Compartilhar → “Adicionar à Tela de Início”. Funciona offline após a primeira visita (service worker `sw.js`).
- **APK Android**: `love-connect-ultimate.apk` (assinatura debug, pacote `com.loveconnect.ultimate`, v1.0). Para instalar: copie ao celular → toque no arquivo → permita “instalar apps desconhecidos” → Instalar. Para gerar de novo: `npm run build && npx cap sync android && cd android && ./gradlew assembleDebug` (exige JDK 21 + Android SDK 34).

## 🗂 Estrutura

```
src/
  types.ts            # entidades
  utils/              # dates, validation, storage, id, auth, logic (+ testes)
  data/seed.ts        # perguntas, ideias, categorias
  store/AppStore.tsx  # estado global + persistência por casal
  components/         # Layout, UI (Card, Modal, Avatar, Stars…)
  pages/              # 17 telas (Dashboard…Settings)
  index.css           # design system
public/               # manifest, sw.js, ícone
```

## 📝 Decisões técnicas

- HashRouter em vez de BrowserRouter: funciona em qualquer hospedagem estática e `file://`.
- Sem biblioteca de UI: CSS próprio romântico, leve e offline.
- Testes em lógica pura (sem jsdom): rápidos e determinísticos.
- DataURL + compressão client-side para fotos sem backend.
