import { useFormContext } from 'react-hook-form';
import Input from '../../components/Input';

export default function StepConsortium() {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Consórcio</h2>
        <p className="text-sm text-neutral-500">
          Informe os parâmetros do consórcio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            validate: (v) =>
              (Number.isFinite(v) && v > 0) ||
              'O valor do crédito deve ser maior que zero.',
          })}
        />
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
          id="adminRateAnnual"
          label="Taxa de administração ao ano (%)"
          type="number"
          step="0.01"
          placeholder="10"
          error={errors.consortium?.adminRateAnnual?.message}
          {...register('consortium.adminRateAnnual', {
            required: 'Informe a taxa de administração.',
            valueAsNumber: true,
            validate: (v) =>
              (Number.isFinite(v) && v >= 0) ||
              'A taxa de administração deve ser maior ou igual a zero.',
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
      </div>
    </div>
  );
}
