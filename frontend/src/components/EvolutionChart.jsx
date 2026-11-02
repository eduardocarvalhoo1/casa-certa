import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../utils/format';

export default function EvolutionChart({ data, seriesName = 'Saldo devedor' }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">
        Sem dados de evolução.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#737373' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#737373' }}
          tickLine={false}
          width={70}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(label) => `Mês ${label}`}
        />
        <Line
          type="monotone"
          dataKey="balance"
          name={seriesName}
          stroke="#111111"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
