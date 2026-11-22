import { NavLink, useNavigate } from 'react-router-dom';
import { clearSession } from '../utils/session';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/simulacao/nova', label: 'Nova Simulação' },
  { to: '/historico', label: 'Histórico' },
  { to: '/perfil', label: 'Perfil' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate('/login');
  }

  return (
    <aside className="sticky top-0 flex h-screen w-48 shrink-0 flex-col border-r border-neutral-200 bg-white lg:w-60">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="text-lg font-semibold text-neutral-900">CasaCerta</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-neutral-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-600 transition-colors hover:bg-neutral-100"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
