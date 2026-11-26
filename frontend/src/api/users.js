import api from './client';

export function createUser(userData) {
  return api.post('/users', userData);
}
