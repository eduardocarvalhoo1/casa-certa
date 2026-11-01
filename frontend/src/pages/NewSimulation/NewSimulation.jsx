import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Stepper from '../../components/Stepper';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import useSimulationForm from '../../hooks/useSimulationForm';
import { createSimulation } from '../../api/simulations';
import StepObjective from './StepObjective';
import StepFinancing from './StepFinancing';
import StepConsortium from './StepConsortium';
import StepSummary from './StepSummary';

const STEP_LABELS = ['Objetivo', 'Financiamento', 'Consórcio', 'Resumo'];

const STEP_FIELDS = [
  ['name', 'objective', 'propertyValue'],
  [
    'system',
    'financing.downPayment',
    'financing.termYears',
    'financing.interestRateAnnual',
  ],
  [
    'consortium.creditValue',
    'consortium.termMonths',
    'consortium.adminRateTotal',
    'consortium.reserveFund',
    'consortium.initialBid',
    'consortium.contemplationMonth',
  ],
  [],
];

function buildPayload(values) {
  const payload = {
    name: values.name,
    objective: values.objective,
    system: values.system,
    propertyValue: Number(values.propertyValue),
    financing: {
      downPayment: Number(values.financing.downPayment),
      termYears: Number(values.financing.termYears),
      interestRateAnnual: Number(values.financing.interestRateAnnual) / 100,
    },
    consortium: {
      creditValue: Number(values.consortium.creditValue),
      termMonths: Number(values.consortium.termMonths),
      adminRateTotal: Number(values.consortium.adminRateTotal) / 100,
      reserveFund: Number(values.consortium.reserveFund) / 100,
    },
  };

  if (values.consortium.initialBid !== undefined) {
    payload.consortium.initialBid = Number(values.consortium.initialBid);
  }

  if (
    values.consortium.contemplationMonth !== undefined &&
    values.consortium.contemplationMonth !== ''
  ) {
    payload.consortium.contemplationMonth = Number(values.consortium.contemplationMonth);
  }

  return payload;
}

function StepsContent({ current }) {
  switch (current) {
    case 0:
      return <StepObjective />;
    case 1:
      return <StepFinancing />;
    case 2:
      return <StepConsortium />;
    case 3:
      return <StepSummary />;
    default:
      return null;
  }
}

function Wizard({ form }) {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { current, isFirst, isLast, next, back } =
    useSimulationForm(STEP_FIELDS);

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = buildPayload(form.getValues());
      const result = await createSimulation(payload);
      navigate(`/comparacao/${result.simulation.id}`, { state: result });
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNext() {
    if (isLast) {
      await handleSubmit();
    } else {
      await next();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Nova Simulação
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Passo a passo para montar seu cenário.
        </p>
      </div>

      <Stepper steps={STEP_LABELS} current={current} />

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <StepsContent current={current} />
      </div>

      {submitError && (
        <ErrorMessage
          message={submitError.message}
          details={submitError.details}
        />
      )}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={back} disabled={isFirst || submitting}>
          Voltar
        </Button>
        <Button onClick={handleNext} disabled={submitting}>
          {isLast ? (submitting ? 'Calculando...' : 'Calcular') : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}

export default function NewSimulation() {
  const form = useForm({
    mode: 'onTouched',
    defaultValues: {
      name: '',
      objective: '',
      system: 'SAC',
      propertyValue: '',
      financing: {
        downPayment: '',
        termYears: '',
        interestRateAnnual: '',
      },
      consortium: {
        creditValue: '',
        termMonths: '',
        adminRateTotal: '',
        reserveFund: '',
        initialBid: '',
        contemplationMonth: '',
      },
    },
  });

  return (
    <FormProvider {...form}>
      <Wizard form={form} />
    </FormProvider>
  );
}
