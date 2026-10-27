import { useFormContext, Controller } from 'react-hook-form';
import Input from '../../components/Input';

const OBJECTIVES = [
  {
    id: 'COMPRAR_IMOVEL',
    title: 'Comprar imóvel',
    description: 'Quero comprar um imóvel residencial.',
  },
  {
    id: 'INVESTIR',
    title: 'Investir',
    description: 'Quero investir em um imóvel para aluguel.',
  },
  {
    id: 'REFINANCIAR',
    title: 'Refinanciar',
    description: 'Quero refinanciar um imóvel já existente.',
  },
];

export default function StepObjective() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Qual é o seu objetivo?
        </h2>
        <p className="text-sm text-neutral-500">
          Selecione o objetivo da simulação.
        </p>
      </div>

      <Controller
        control={control}
        name="objective"
        rules={{ required: 'Selecione um objetivo.' }}
        render={({ field }) => (
          <div className="grid gap-4 sm:grid-cols-3">
            {OBJECTIVES.map((opt) => {
              const selected = field.value === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => field.onChange(opt.id)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    selected
                      ? 'border-neutral-900 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <span className="block font-medium text-neutral-900">
                    {opt.title}
                  </span>
                  <span className="mt-1 block text-sm text-neutral-500">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      />
      {errors.objective && (
        <span className="text-xs text-red-600">{errors.objective.message}</span>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="name"
          label="Nome da simulação"
          placeholder="Ex: Apartamento Novo"
          error={errors.name?.message}
          {...register('name', {
            required: 'Informe um nome para a simulação.',
          })}
        />
        <Input
          id="propertyValue"
          label="Valor do imóvel (R$)"
          type="number"
          step="0.01"
          placeholder="450000"
          error={errors.propertyValue?.message}
          {...register('propertyValue', {
            required: 'Informe o valor do imóvel.',
            valueAsNumber: true,
            validate: (v) =>
              (Number.isFinite(v) && v > 0) ||
              'O valor do imóvel deve ser maior que zero.',
          })}
        />
      </div>
    </div>
  );
}
