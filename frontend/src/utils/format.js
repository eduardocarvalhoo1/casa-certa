const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }
  return brlFormatter.format(Number(value));
}

export function formatDate(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function formatPercent(decimal, fractionDigits = 2) {
  if (decimal === null || decimal === undefined || Number.isNaN(Number(decimal))) {
    return '—';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(decimal));
}

export function formatTerm(months) {
  if (months === null || months === undefined || Number.isNaN(Number(months))) {
    return '—';
  }
  const m = Number(months);
  if (m % 12 === 0) {
    const years = m / 12;
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${m} ${m === 1 ? 'mês' : 'meses'}`;
}
