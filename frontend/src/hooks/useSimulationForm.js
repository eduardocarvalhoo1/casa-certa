import { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

export default function useSimulationForm(stepFields) {
  const { trigger } = useFormContext();
  const [current, setCurrent] = useState(0);

  const lastIndex = stepFields.length - 1;

  const next = useCallback(async () => {
    const fields = stepFields[current];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid && current < lastIndex) {
      setCurrent((c) => c + 1);
    }
    return valid;
  }, [current, lastIndex, stepFields, trigger]);

  const back = useCallback(() => {
    setCurrent((c) => Math.max(0, c - 1));
  }, []);

  return {
    current,
    isFirst: current === 0,
    isLast: current === lastIndex,
    next,
    back,
  };
}
