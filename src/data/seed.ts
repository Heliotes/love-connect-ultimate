// Conteúdo inicial e listas de apoio (perguntas, ideias, categorias).
import type { QuizQuestion } from '../types';

export const WHEEL_CATEGORIES = [
  'Restaurantes',
  'Filmes',
  'Passeios',
  'Jogos',
  'Receitas',
  'Viagens',
  'Em casa',
  'Gratuitas',
  'Personalizadas',
] as const;

export const DEFAULT_WHEEL_OPTIONS: { label: string; category: string }[] = [
  { label: 'Noite de pizza + filme', category: 'Em casa' },
  { label: 'Piquenique no parque', category: 'Gratuitas' },
  { label: 'Restaurante italiano novo', category: 'Restaurantes' },
  { label: 'Maratona da nossa série', category: 'Filmes' },
  { label: 'Passeio no centro histórico', category: 'Passeios' },
  { label: 'Cozinhar receita nova juntos', category: 'Receitas' },
  { label: 'Noite de jogos de tabuleiro', category: 'Jogos' },
  { label: 'Bate-volta na praia', category: 'Viagens' },
  { label: 'Observar as estrelas', category: 'Gratuitas' },
  { label: 'Spa caseiro a dois', category: 'Em casa' },
];

export const KNOW_QUIZ: QuizQuestion[] = [
  { id: 'k1', game: 'conhece', question: 'Qual é a comida favorita do seu amor?', choices: ['Massas', 'Japonesa', 'Brasileira', 'Doces'], answer: 'Massas' },
  { id: 'k2', game: 'conhece', question: 'Qual o filme que ele(a) mais ama?', choices: ['Comédia romântica', 'Aventura', 'Drama', 'Terror'], answer: 'Comédia romântica' },
  { id: 'k3', game: 'conhece', question: 'Manhã ideal para ele(a)?', choices: ['Café na cama', 'Caminhada', 'Academia', 'Dormir até tarde'], answer: 'Café na cama' },
  { id: 'k4', game: 'conhece', question: 'Cor favorita?', choices: ['Rosa', 'Azul', 'Verde', 'Preto'], answer: 'Rosa' },
  { id: 'k5', game: 'conhece', question: 'Viagem dos sonhos?', choices: ['Praia', 'Montanha', 'Europa', 'Aventura'], answer: 'Praia' },
  { id: 'k6', game: 'conhece', question: 'Qual seu maior medo bobo?', choices: ['Aranha', 'Altura', 'Escuro', 'Filme de terror'], answer: 'Aranha' },
];

export const MEMORY_QUESTIONS: string[] = [
  'Onde foi nosso primeiro encontro?',
  'Qual foi a primeira viagem juntos?',
  'Qual música marcou nosso início?',
  'Qual foi o presente mais especial?',
  'Qual o programa favorito a dois?',
  'Qual foi o dia mais engraçado juntos?',
];

export const MOST_LIKELY: string[] = [
  'Quem é mais provável de chorar num filme?',
  'Quem é mais provável de planejar uma surpresa?',
  'Quem é mais provável de dormir no sofá?',
  'Quem é mais provável de cozinhar algo novo?',
  'Quem é mais provável de se perder mesmo com GPS?',
  'Quem é mais provável de lembrar de todas as datas?',
];

export const TRUTH_LIGHT: string[] = [
  'Qual foi sua primeira impressão de mim?',
  'O que você mais admira em mim?',
  'Qual momento nosso você reviveria?',
  'O que você quer fazer comigo este ano?',
  'Qual mania minha você mais ama?',
];

export const DARE_LIGHT: string[] = [
  'Faça um elogio criativo agora.',
  'Prepare nossa bebida favorita.',
  'Escolha a próxima música e dancem juntos.',
  'Escreva um bilhete de 3 linhas.',
  'Planeje o próximo encontro em 5 minutos.',
];

export const DAILY_QUESTIONS: string[] = [
  'O que te fez sorrir hoje?',
  'Qual pequeno gesto te faria feliz amanhã?',
  'Qual memória nossa você guardaria para sempre?',
  'O que você quer aprender junto comigo?',
  'Qual é o seu plano favorito para o fim de semana?',
  'O que você mais valoriza no nosso relacionamento?',
  'Se pudéssemos viajar amanhã, para onde iríamos?',
];

export const GIFT_IDEAS: { title: string; detail: string }[] = [
  { title: 'Carta manuscrita', detail: 'Vale mais que qualquer presente caro.' },
  { title: 'Álbum de memórias', detail: 'Imprima as fotos favoritas do app.' },
  { title: 'Jantar surpresa', detail: 'Cozinhe o prato favorito dele(a).' },
  { title: 'Playlist dedicada', detail: 'Monte na seção Música e compartilhe.' },
  { title: 'Dia sem celular', detail: 'Presença total por 24h.' },
  { title: 'Caixa dos motivos', detail: '30 motivos pelos quais você ama.' },
];

export const MESSAGES_OF_DAY: string[] = [
  'Amar é escolher a mesma pessoa todos os dias. 💕',
  'Que hoje tenha um motivo a mais para sorrir a dois.',
  'Pequenos gestos constroem grandes histórias.',
  'Respirem fundo: vocês são um time. 💪💗',
  'Conte até 3 e elogie seu amor agora.',
];

export const EVENT_CATEGORIES = [
  'encontro',
  'viagem',
  'aniversario',
  'especial',
  'lembrete',
  'outro',
] as const;

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Presentes',
  'Viagem',
  'Outros',
];

export const MOVIE_GENRES = [
  'Romance',
  'Comédia',
  'Drama',
  'Aventura',
  'Terror',
  'Documentário',
  'Animação',
  'Outro',
];

export const MOODS = ['😍', '😊', '🥰', '😴', '😟', '😢', '😡', '🤒'];

export const COVERS = ['🌹', '💌', '🌙', '🌅', '🎂', '✈️'];
