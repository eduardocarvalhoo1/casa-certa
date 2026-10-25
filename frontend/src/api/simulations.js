import api from './client';

export function createSimulation(payload) {
  return api.post('/api/simulations', payload);
}

export function listSimulations() {
  return api.get('/api/simulations');
}

export function getSimulation(id) {
  return api.get(`/api/simulations/${id}`);
}
