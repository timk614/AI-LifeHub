export type StoredMarket = {
  id: string;
  title: string;
  createdAt: string;
  price: number;
  currency: string;
  imageName?: string | null;
  result: unknown;
};

export type StoredStudy = {
  id: string;
  topic: string;
  subject: string;
  createdAt: string;
  result: unknown;
};

export type StoredChat = {
  id: string;
  title: string;
  createdAt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
};

const read = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(`lifehub:${key}`);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
};

const write = <T>(key: string, value: T) => localStorage.setItem(`lifehub:${key}`, JSON.stringify(value));

export const storage = {
  markets: () => read<StoredMarket[]>('markets', []),
  studies: () => read<StoredStudy[]>('studies', []),
  chats: () => read<StoredChat[]>('chats', []),
  favorites: () => read<string[]>('favorites', []),
  plans: () => read<{ id: string; title: string; progress: number }[]>('plans', [
    { id: 'plan-1', title: 'Build a steady learning rhythm', progress: 42 },
    { id: 'plan-2', title: 'Make smarter secondhand buys', progress: 68 },
  ]),
  exercises: () => read<{ id: string; prompt: string; createdAt: string }[]>('exercises', []),
  profile: () => read('profile', { name: 'Mira Novak', email: 'mira@example.com', language: 'English' }),
  preferences: () => read('preferences', { theme: 'light', notifications: true, language: 'English' }),
  saveMarkets: (value: StoredMarket[]) => write('markets', value),
  saveStudies: (value: StoredStudy[]) => write('studies', value),
  saveChats: (value: StoredChat[]) => write('chats', value),
  saveFavorites: (value: string[]) => write('favorites', value),
  savePlans: (value: { id: string; title: string; progress: number }[]) => write('plans', value),
  saveExercises: (value: { id: string; prompt: string; createdAt: string }[]) => write('exercises', value),
  saveProfile: (value: unknown) => write('profile', value),
  savePreferences: (value: unknown) => write('preferences', value),
  clear: () => Object.keys(localStorage).filter((key) => key.startsWith('lifehub:')).forEach((key) => localStorage.removeItem(key)),
};

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const timeAgo = (date: string) => {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};