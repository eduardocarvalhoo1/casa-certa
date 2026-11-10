import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSimulations, deleteSimulation } from '../api/simulations';
import useApi from '../hooks/useApi';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/format';
import { objectiveLabel, recommendedOptionLabel } from '../utils/session';

const GRID_COLUMNS =
  'grid flex-1 grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_8rem] items-center gap-4 px-2';

const ACTION_COLUMN = 'w-24 shrink-0 text-right';

const OPTION_FILTERS = [
  { value: '', label: 'Todas as opções' },
  { value: 'FINANCING', label: 'Financiamento' },
  { value: 'CONSORTIUM', label: 'Consórcio' },
];

export default function History() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [option, setOption] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchSimulations = useCallback(() => listSimulations(), []);
  const { data, setData, loading, error, reload } = useApi(fetchSimulations);

  const simulations = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return simulations.filter((s) => {
      const matchesName = !term || s.name?.toLowerCase().includes(term);
      const matchesOption = !option || s.recommendedOption === option;
      return matchesName && matchesOption;
    });
  }, [simulations, search, option]);

  const hasFilters = search.trim() !== '' || option !== '';

  function clearFilters() {
    setSearch('');
    setOption('');
  }

  function removeFromList(id) {
    setData((prev) =>
      Array.isArray(prev) ? prev.filter((s) => s.id !== id) : prev
    );
  }

  function openDeleteDialog(simulation) {
    setDeleteError(null);
    setPendingDelete(simulation);
  }

  const closeDeleteDialog = useCallback(() => {
    setPendingDelete(null);
    setDeleteError(null);
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSimulation(pendingDelete.id);
      removeFromList(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      if (err.status === 404) {
        removeFromList(pendingDelete.id);
        setPendingDelete(null);
      } else {
        setDeleteError(err.message);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Histórico de Simulações
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Consulte e gerencie seus cenários anteriores.
        </p>
      </div>

      {loading && <Loading message="Carregando histórico..." />}

      {!loading && error && (
        <ErrorMessage
          message={error.message}
          details={error.details}
          onRetry={reload}
        />
      )}

      {!loading && !error && simulations.length === 0 && (
        <EmptyState
          title="Nenhuma simulação ainda"
          description="Suas simulações aparecerão aqui depois que você criar a primeira."
          action={
            <Button onClick={() => navigate('/simulacao/nova')}>
              Nova simulação
            </Button>
          }
        />
      )}

      {!loading && !error && simulations.length > 0 && (
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome"
              aria-label="Buscar por nome"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 sm:max-w-xs"
            />
            <select
              value={option}
              onChange={(e) => setOption(e.target.value)}
              aria-label="Filtrar por melhor opção"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              {OPTION_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="flex items-center border-b border-neutral-200 pb-2 text-xs uppercase tracking-wide text-neutral-500">
                <div className={GRID_COLUMNS}>
                  <span>Simulação</span>
                  <span>Data</span>
                  <span>Objetivo</span>
                  <span>Valor do imóvel</span>
                  <span className="justify-self-end">Melhor opção</span>
                </div>
                <span className={ACTION_COLUMN}>
                  <span className="sr-only">Ações</span>
                </span>
              </div>

              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-500">
                  Nenhuma simulação corresponde aos filtros.
                </p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {filtered.map((s) => (
                    <li key={s.id} className="flex items-center hover:bg-neutral-50">
                      <button
                        type="button"
                        onClick={() => navigate(`/comparacao/${s.id}`)}
                        className={`${GRID_COLUMNS} py-3 text-left`}
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
                        <span className="truncate text-sm text-neutral-700">
                          {objectiveLabel(s.objective)}
                        </span>
                        <span className="text-sm text-neutral-900">
                          {formatCurrency(s.propertyValue)}
                        </span>
                        <span className="justify-self-end rounded-full border border-neutral-300 px-3 py-1 text-center text-xs text-neutral-700">
                          {recommendedOptionLabel(s.recommendedOption)}
                        </span>
                      </button>
                      <div className={ACTION_COLUMN}>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(s)}
                          aria-label={`Excluir simulação ${s.name}`}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Excluir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs text-neutral-400">
            {filtered.length} de {simulations.length} simulações
          </p>
        </Card>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir simulação?"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.name}"? Essa ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
