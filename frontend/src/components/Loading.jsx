export default function Loading({ message = 'Carregando...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-neutral-500">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700"
        aria-hidden="true"
      />
      <span className="text-sm">{message}</span>
    </div>
  );
}
