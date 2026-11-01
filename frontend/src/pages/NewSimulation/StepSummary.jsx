import { useFormContext } from 'react-hook-form';
import { formatCurrency } from '../../utils/format';
import { objectiveLabel } from '../../utils/session';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}

export default function StepSummary() {
  const { getValues } = useFormContext();
  const v = getValues();

  const bid = v.consortium?.initialBid;
  const ownResources =
    Number(v.propertyValue) - Number(v.consortium?.creditValue);

  const contemplation = v.consortium?.contemplationMonth;
  const termMonths = Number(v.consortium?.termMonths);
  const contemplationLabel =
    contemplation !== undefined && contemplation !== ''
      ? `Mês ${contemplation}`
      : Number.isInteger(termMonths) && termMonths > 0
        ? `Mês ${Math.ceil(termMonths / 2)} (metade do prazo)`
        : '—';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Resumo</h2>
        <p className="text-sm text-neutral-500">
          Revise os dados antes de calcular a simulação.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">Geral</h3>
          <Row label="Nome" value={v.name || '—'} />
          <Row label="Objetivo" value={objectiveLabel(v.objective)} />
          <Row label="Valor do imóvel" value={formatCurrency(v.propertyValue)} />
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">
            Financiamento
          </h3>
          <Row label="Sistema" value={v.system || '—'} />
          <Row label="Entrada" value={formatCurrency(v.financing?.downPayment)} />
          <Row label="Prazo" value={`${v.financing?.termYears ?? '—'} anos`} />
          <Row
            label="Juros ao ano"
            value={`${v.financing?.interestRateAnnual ?? '—'}%`}
          />
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">
            Consórcio
          </h3>
          <Row label="Crédito" value={formatCurrency(v.consortium?.creditValue)} />
          {ownResources > 0 && (
            <Row label="Recursos próprios" value={formatCurrency(ownResources)} />
          )}
          <Row
            label="Prazo"
            value={`${v.consortium?.termMonths ?? '—'} meses`}
          />
          <Row
            label="Taxa de adm. total"
            value={`${v.consortium?.adminRateTotal ?? '—'}%`}
          />
          <Row
            label="Fundo de reserva"
            value={`${v.consortium?.reserveFund ?? '—'}%`}
          />
          <Row
            label="Lance"
            value={bid === undefined ? '—' : formatCurrency(bid)}
          />
          <Row
            label="Contemplação estimada"
            value={contemplationLabel}
          />
        </div>
      </div>
    </div>
  );
}
