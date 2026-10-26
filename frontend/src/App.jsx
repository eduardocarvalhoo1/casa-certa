import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';

function Placeholder({ title }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-neutral-500">Em construção.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Placeholder title="Dashboard" />} />
        <Route
          path="simulacao/nova"
          element={<Placeholder title="Nova Simulação" />}
        />
        <Route
          path="comparacao/:id"
          element={<Placeholder title="Comparação" />}
        />
        <Route path="historico" element={<Placeholder title="Histórico" />} />
        <Route path="perfil" element={<Placeholder title="Perfil" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
