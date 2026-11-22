import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { clearSession, getSessionUser } from '../utils/session';

function getInitials(name, email) {
  const source = name || email || '';
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
  return initials || '?';
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[10rem_minmax(0,1fr)] items-center gap-4 py-3">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="truncate text-sm font-medium text-neutral-900">
        {value || '—'}
      </span>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const user = getSessionUser();

  function handleLogout() {
    clearSession();
    navigate('/login');
  }

  const expired = user?.expiresAt ? user.expiresAt.getTime() < Date.now() : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Perfil</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Dados da sua conta.
        </p>
      </div>

      {!user ? (
        <EmptyState
          title="Nenhuma sessão ativa"
          description="Entre na sua conta para ver os dados do perfil."
        />
      ) : (
        <Card>
          <div className="flex items-center gap-4 border-b border-neutral-100 pb-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-lg font-semibold text-white">
              {getInitials(user.name, user.email)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-neutral-900">
                {user.name || 'Usuário'}
              </p>
              <p className="truncate text-sm text-neutral-500">{user.email}</p>
            </div>
          </div>

          <div className="divide-y divide-neutral-100">
            <InfoRow label="Nome" value={user.name} />
            <InfoRow label="E-mail" value={user.email} />
            <InfoRow
              label="Sessão válida até"
              value={
                user.expiresAt
                  ? `${formatDateTime(user.expiresAt)}${expired ? ' (expirada)' : ''}`
                  : null
              }
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={handleLogout}>
              Sair da conta
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
