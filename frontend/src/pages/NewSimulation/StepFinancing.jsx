import { useFormContext, Controller } from 'react-hook-form';
import Input from '../../components/Input';

const SYSTEMS = ['SAC', 'PRICE'];

export default function StepFinancing() {
  const {
    register,
    control,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Financiamento</h2>
        <p className="text-sm text-neutral-500">
          Informe os parâmetros do financiamento.
        </p>
      </div>

      <Controller
        control={control}
        name="system"
        rules={{ required: 'Selecione o sistema de amortização.' }}
        render={({ field }) => (
          <div className="inline-flex rounded-lg border border-neutral-200 p-1">
            {SYSTEMS.map((sys) => {
              const selected = field.value === sys;
              return (
                <button
                  type="button"
                  key={sys}
                  onClick={() => field.onChange(sys)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {sys}
                </button>
              );
            })}
          </div>
        )}
      />
      {errors.system && (
        <span className="block text-xs text-red-600">
          {errors.system.message}
        </span>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="downPayment"
          label="Entrada (R$)"
          type="number"
          step="0.01"
          placeholder="90000"
          error={errors.financing?.downPayment?.message}
          {...register('financing.downPayment', {
            required: 'Informe o valor da entrada.',
            valueAsNumber: true,
            validate: (v) => {
              if (!Number.isFinite(v) || v < 0) {
                return 'A entrada deve ser um número maior ou igual a zero.';
              }
              const propertyValue = Number(getValues('propertyValue'));
              if (Number.isFinite(propertyValue) && v >= propertyValue) {
                return 'A entrada deve ser menor que o valor do imóvel.';
              }
              return true;
            },
          })}
        />
        <Input
          id="termYears"
          label="Prazo (anos)"
          type="number"
          step="1"
          placeholder="30"
          error={errors.financing?.termYears?.message}
          {...register('financing.termYears', {
            required: 'Informe o prazo em anos.',
            valueAsNumber: true,
            validate: (v) =>
              (Number.isInteger(v) && v > 0) ||
              'O prazo deve ser um número inteiro de anos maior que zero.',
          })}
        />
        <Input
          id="interestRateAnnual"
          label="Taxa de juros ao ano (%)"
          type="number"
          step="0.01"
          placeholder="9.5"
          error={errors.financing?.interestRateAnnual?.message}
          {...register('financing.interestRateAnnual', {
            required: 'Informe a taxa de juros anual.',
            valueAsNumber: true,
            validate: (v) =>
              (Number.isFinite(v) && v > 0) ||
              'A taxa de juros deve ser maior que zero.',
          })}
        />
      </div>
    </div>
  );
}
