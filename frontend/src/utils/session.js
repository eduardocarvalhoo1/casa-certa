import { getToken, setToken } from '../api/client';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('cc_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getTokenPayload() {
  const token = getToken();
  if (!token) return null;
  const [, payload] = token.split('.');
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getSessionUser() {
  const stored = getStoredUser();
  const payload = getTokenPayload();
  if (!stored && !payload) return null;
  return {
    id: stored?.id ?? payload?.id ?? null,
    name: stored?.name ?? payload?.name ?? null,
    email: stored?.email ?? payload?.email ?? null,
    expiresAt: payload?.exp ? new Date(payload.exp * 1000) : null,
  };
}

export function clearSession() {
  setToken(null);
  localStorage.removeItem('cc_user');
}

export function recommendedOptionLabel(option) {
  if (option === 'FINANCING') return 'Financiamento';
  if (option === 'CONSORTIUM') return 'Consórcio';
  return '—';
}

export function objectiveLabel(objective) {
  const map = {
    COMPRAR_IMOVEL: 'Comprar Imóvel',
    INVESTIR: 'Investir',
    REFINANCIAR: 'Refinanciar',
  };
  return map[objective] || objective || '—';
}
