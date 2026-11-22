export default function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, index) => {
        const isActive = index === current;
        const isDone = index < current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                isActive
                  ? 'bg-neutral-900 text-white'
                  : isDone
                    ? 'bg-neutral-700 text-white'
                    : 'border border-neutral-300 text-neutral-400'
              }`}
            >
              {index + 1}
            </span>
            <span
              title={label}
              className={`truncate text-sm ${
                isActive ? 'font-medium text-neutral-900' : 'text-neutral-400'
              }`}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-2 h-px min-w-4 flex-1 bg-neutral-200" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
