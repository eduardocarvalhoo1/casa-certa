import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSimulations } from '../api/simulations';
import useApi from '../hooks/useApi';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/format';
import {
  getStoredUser,
  recommendedOptionLabel,
} from '../utils/session';

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const fetchSimulations = useCallback(() => listSimulations(), []);
  const { data, loading, error, reload } = useApi(fetchSimulations);

  const simulations = Array.isArray(data) ? data : [];
  const total = simulations.length;
  const goal = simulations.reduce(
    (max, s) => Math.max(max, Number(s.propertyValue) || 0),
    0
  );
  const recent = simulations.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Olá{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Bem-vindo de volta.</p>
        </div>
        <Button onClick={() => navigate('/simulacao/nova')}>
          Nova simulação
        </Button>
      </div>

      {loading && <Loading message="Carregando suas simulações..." />}

      {!loading && error && (
        <ErrorMessage
          message={error.message}
          details={error.details}
          onRetry={reload}
        />
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Simulações realizadas" value={total} />
            <SummaryCard label="Meta de valor do imóvel" value={formatCurrency(goal)} />
            <SummaryCard
              label="Perfil"
              value={user?.email ? user.email : '—'}
            />
          </div>

          <Card
            title="Simulações recentes"
            action={
              total > 0 ? (
                <button
                  type="button"
                  onClick={() => navigate('/historico')}
                  className="text-sm text-neutral-500 hover:text-neutral-900"
                >
                  Ver todas
                </button>
              ) : null
            }
          >
            {total === 0 ? (
              <EmptyState
                title="Nenhuma simulação ainda"
                description="Crie sua primeira simulação para comparar financiamento e consórcio."
                action={
                  <Button onClick={() => navigate('/simulacao/nova')}>
                    Nova simulação
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-neutral-100">
                {recent.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/comparacao/${s.id}`)}
                      className="grid w-full grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_8rem] items-center gap-4 px-2 py-3 text-left hover:bg-neutral-50"
                    >
                      <span
                        className="truncate font-medium text-neutral-900"
                        title={s.name}
                      >
                        {s.name}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {formatDate(s.createdAt)}
                      </span>
                      <span className="text-sm text-neutral-900">
                        {formatCurrency(s.propertyValue)}
                      </span>
                      <span className="justify-self-end rounded-full border border-neutral-300 px-3 py-1 text-center text-xs text-neutral-700">
                        {recommendedOptionLabel(s.recommendedOption)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
