export default function Card({ title, action, children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-5 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
