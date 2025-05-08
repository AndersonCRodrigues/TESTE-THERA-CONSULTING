import { AuthResponse, LoginCredentials } from '../types/auth';
import { api } from './api';


export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/user/me');
  return response.data;
};