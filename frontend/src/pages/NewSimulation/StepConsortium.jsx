import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import Input from '../../components/Input';
import { formatCurrency } from '../../utils/format';

export default function StepConsortium() {
  const {
    register,
    getValues,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useFormContext();

  const propertyValue = Number(watch('propertyValue'));
  const creditValue = Number(watch('consortium.creditValue'));
  const creditEditedByUser = Boolean(dirtyFields.consortium?.creditValue);

  useEffect(() => {
    if (!creditEditedByUser && Number.isFinite(propertyValue) && propertyValue > 0) {
      setValue('consortium.creditValue', propertyValue);
    }
  }, [creditEditedByUser, propertyValue, setValue]);

  const ownResources =
    Number.isFinite(propertyValue) && Number.isFinite(creditValue)
      ? propertyValue - creditValue
      : 0;

  const termMonths = Number(watch('consortium.termMonths'));
  const defaultContemplation =
    Number.isInteger(termMonths) && termMonths > 0 ? Math.ceil(termMonths / 2) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Consórcio</h2>
        <p className="text-sm text-neutral-500">
          Informe os parâmetros do consórcio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Input
            id="creditValue"
            label="Valor do crédito (R$)"
            type="number"
            step="0.01"
            placeholder="450000"
            error={errors.consortium?.creditValue?.message}
            {...register('consortium.creditValue', {
              required: 'Informe o valor do crédito.',
              valueAsNumber: true,
              validate: (v) => {
                if (!Number.isFinite(v) || v <= 0) {
                  return 'O valor do crédito deve ser maior que zero.';
                }
                const property = Number(getValues('propertyValue'));
                if (Number.isFinite(property) && v > property) {
                  return 'O crédito não pode ser maior que o valor do imóvel.';
                }
                return true;
              },
            })}
          />
          {!errors.consortium?.creditValue && ownResources > 0 && (
            <span className="text-xs text-neutral-500">
              A diferença de {formatCurrency(ownResources)} para o valor do
              imóvel será paga com recursos próprios.
            </span>
          )}
        </div>
        <Input
          id="termMonths"
          label="Prazo (meses)"
          type="number"
          step="1"
          placeholder="180"
          error={errors.consortium?.termMonths?.message}
          {...register('consortium.termMonths', {
            required: 'Informe o prazo em meses.',
            valueAsNumber: true,
            validate: (v) =>
              (Number.isInteger(v) && v > 0) ||
              'O prazo deve ser um número inteiro de meses maior que zero.',
          })}
        />
        <Input
          id="adminRateTotal"
          label="Taxa de administração total do plano (%)"
          type="number"
          step="0.01"
          placeholder="16"
          error={errors.consortium?.adminRateTotal?.message}
          {...register('consortium.adminRateTotal', {
            required: 'Informe a taxa de administração.',
            valueAsNumber: true,
            validate: (v) =>
              (Number.isFinite(v) && v >= 0 && v <= 100) ||
              'A taxa de administração deve estar entre 0% e 100%.',
          })}
        />
        <Input
          id="reserveFund"
          label="Fundo de reserva (%)"
          type="number"
          step="0.01"
          placeholder="2"
          error={errors.consortium?.reserveFund?.message}
          {...register('consortium.reserveFund', {
            required: 'Informe o fundo de reserva.',
            valueAsNumber: true,
            validate: (v) =>
              (Number.isFinite(v) && v >= 0) ||
              'O fundo de reserva deve ser maior ou igual a zero.',
          })}
        />
        <Input
          id="initialBid"
          label="Lance inicial (R$) — opcional"
          type="number"
          step="0.01"
          placeholder="45000"
          error={errors.consortium?.initialBid?.message}
          {...register('consortium.initialBid', {
            setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
            validate: (v) => {
              if (v === undefined) return true;
              if (!Number.isFinite(v) || v < 0) {
                return 'O lance deve ser um número maior ou igual a zero.';
              }
              const creditValue = Number(getValues('consortium.creditValue'));
              if (Number.isFinite(creditValue) && v >= creditValue) {
                return 'O lance deve ser menor que o valor do crédito.';
              }
              return true;
            },
          })}
        />
        <div className="flex flex-col gap-1">
          <Input
            id="contemplationMonth"
            label="Mês estimado de contemplação — opcional"
            type="number"
            step="1"
            placeholder={defaultContemplation ? String(defaultContemplation) : '90'}
            error={errors.consortium?.contemplationMonth?.message}
            {...register('consortium.contemplationMonth', {
              setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
              validate: (v) => {
                if (v === undefined) return true;
                if (!Number.isInteger(v) || v < 1) {
                  return 'O mês deve ser um número inteiro maior que zero.';
                }
                const term = Number(getValues('consortium.termMonths'));
                if (Number.isInteger(term) && v > term) {
                  return 'O mês de contemplação não pode ser maior que o prazo.';
                }
                return true;
              },
            })}
          />
          {!errors.consortium?.contemplationMonth && defaultContemplation && (
            <span className="text-xs text-neutral-500">
              Se não informado, usamos metade do prazo (mês {defaultContemplation}).
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
