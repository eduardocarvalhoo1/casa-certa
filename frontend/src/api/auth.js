import api from './client';

export function loginUser(credentials) {
  return api.post('/auth/login', credentials);
}