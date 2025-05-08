import { User } from '@/types/user';

export const getUserFromLocalStorage = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const user = localStorage.getItem('user');
  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const setUserToLocalStorage = (user: User): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('user', JSON.stringify(user));
};

export const setTokenToLocalStorage = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('token', token);
};

export const clearAuthFromLocalStorage = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('user');
  localStorage.removeItem('token');
};