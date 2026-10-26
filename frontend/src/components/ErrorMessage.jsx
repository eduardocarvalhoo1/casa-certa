export default function ErrorMessage({ message, details, onRetry }) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p className="font-medium">{message}</p>
      {Array.isArray(details) && details.length > 0 && (
        <ul className="mt-2 list-inside list-disc space-y-1 text-red-600">
          {details.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
