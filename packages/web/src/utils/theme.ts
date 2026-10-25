import { createStorage } from '@maxigarcia/js-utils';

export type Theme = 'light' | 'dark';

const themeStorage = createStorage<Theme>('theme');

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export function getStoredTheme(): Theme {
  const stored = themeStorage.getItem();
  return isTheme(stored) ? stored : 'dark';
}

export function getTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function applyStoredTheme(): void {
  document.documentElement.classList.toggle('dark', getStoredTheme() === 'dark');
}

export function setTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  themeStorage.setItem(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = getStoredTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
