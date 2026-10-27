export function getStoredUser() {
  try {
    const raw = localStorage.getItem('cc_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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
