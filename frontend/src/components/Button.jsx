const VARIANTS = {
  primary:
    'bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-400',
  secondary:
    'border border-neutral-300 text-neutral-900 hover:bg-neutral-100 disabled:opacity-50',
  ghost: 'text-neutral-700 hover:bg-neutral-100 disabled:opacity-50',
};

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
