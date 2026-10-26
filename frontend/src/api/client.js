import axios from 'axios';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const STORAGE_TOKEN_KEY = 'cc_token';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function getToken() {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError(
          0,
          'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
        )
      );
    }

    const { status, data } = error.response;

    if (status === 401 && typeof unauthorizedHandler === 'function') {
      unauthorizedHandler();
    }

    const message =
      data?.error || data?.message || 'Ocorreu um erro inesperado.';

    return Promise.reject(new ApiError(status, message, data?.details));
  }
);

export default api;
