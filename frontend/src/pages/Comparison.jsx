import { useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getSimulation } from '../api/simulations';
import useApi from '../hooks/useApi';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EvolutionChart from '../components/EvolutionChart';
import BalanceChart from '../components/BalanceChart';
import { formatCurrency, formatTerm } from '../utils/format';
import { recommendedOptionLabel } from '../utils/session';
import { buildComparison, estimatedSavings } from '../utils/comparison';

function formatTimeToProperty(months) {
  return Number(months) === 0 ? 'Imediato' : `${formatTerm(months)} (estimado)`;
}

function IndicatorRow({ label, financing, consortium, format }) {
  const render = (value) =>
    value === null || value === undefined ? '—' : format(value);
  return (
    <tr className="border-t border-neutral-100">
      <td className="py-3 pr-4 text-sm font-medium text-neutral-700">{label}</td>
      <td className="py-3 pr-4 text-sm text-neutral-900">{render(financing)}</td>
      <td className="py-3 text-sm text-neutral-900">{render(consortium)}</td>
    </tr>
  );
}

function ComparisonContent({ result }) {
  const comparison = buildComparison(result);
  const recommendation = result.recommendation;
  const financing = result.financingResult;
  const consortium = result.consortiumResult;

  const recommended = recommendation?.recommendedOption;
  const savings = estimatedSavings(comparison);

  const systemLabel = result.simulation?.system
    ? `Financiamento (${result.simulation.system})`
    : 'Financiamento';

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Cenários simulados" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-xs uppercase tracking-wide text-neutral-500">
                    Indicador
                  </th>
                  <th className="pb-2 text-left text-xs uppercase tracking-wide text-neutral-500">
                    {systemLabel}
                  </th>
                  <th className="pb-2 text-left text-xs uppercase tracking-wide text-neutral-500">
                    Consórcio
                  </th>
                </tr>
              </thead>
              <tbody>
                <IndicatorRow
                  label="Parcela inicial"
                  financing={comparison?.initialPayment?.financing}
                  consortium={comparison?.initialPayment?.consortium}
                  format={formatCurrency}
                />
                <IndicatorRow
                  label="Total pago"
                  financing={comparison?.totalCost?.financing}
                  consortium={comparison?.totalCost?.consortium}
                  format={formatCurrency}
                />
                <IndicatorRow
                  label="Total de juros / taxas"
                  financing={comparison?.interestOrTaxes?.financing}
                  consortium={comparison?.interestOrTaxes?.consortium}
                  format={formatCurrency}
                />
                <IndicatorRow
                  label="Prazo para quitar"
                  financing={comparison?.timeframe?.financing}
                  consortium={comparison?.timeframe?.consortium}
                  format={formatTerm}
                />
                <IndicatorRow
                  label="Tempo até ter o imóvel"
                  financing={comparison?.timeToProperty?.financing}
                  consortium={comparison?.timeToProperty?.consortium}
                  format={formatTimeToProperty}
                />
                <IndicatorRow
                  label="Pago com recursos próprios"
                  financing={comparison?.downPaymentOrBid?.financing}
                  consortium={comparison?.downPaymentOrBid?.consortium}
                  format={formatCurrency}
                />
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Nossa recomendação">
          {recommended ? (
            <div className="text-center">
              <p className="text-2xl font-semibold text-neutral-900">
                {recommendedOptionLabel(recommended)}
              </p>
              {savings !== null && (
                <>
                  <p className="mt-3 text-sm text-neutral-500">
                    Esta opção pode gerar uma economia de até
                  </p>
                  <p className="mt-1 text-xl font-semibold text-neutral-900">
                    {formatCurrency(savings)}
                  </p>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Recomendação indisponível.
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Evolução das parcelas (financiamento)">
          <EvolutionChart
            data={financing?.evolution}
            seriesName="Saldo devedor"
          />
        </Card>
        <Card title="Evolução do saldo (consórcio)">
          <BalanceChart data={consortium?.evolution} />
        </Card>
      </div>
    </div>
  );
}

export default function Comparison() {
  const { id } = useParams();
  const location = useLocation();
  const stateResult = location.state;

  const fetchSimulation = useCallback(() => getSimulation(id), [id]);
  const { data, loading, error, reload } = useApi(fetchSimulation, {
    immediate: !stateResult,
  });

  const result = stateResult || data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Comparação</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Financiamento x Consórcio
        </p>
      </div>

      {loading && <Loading message="Carregando comparação..." />}

      {!loading && error && (
        <ErrorMessage
          message={
            error.status === 404
              ? 'Simulação não encontrada.'
              : error.message
          }
          details={error.details}
          onRetry={error.status === 404 ? undefined : reload}
        />
      )}

      {!loading && !error && result && <ComparisonContent result={result} />}
    </div>
  );
}
