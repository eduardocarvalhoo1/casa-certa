import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Loading from './components/Loading';
import Dashboard from './pages/Dashboard';
import NewSimulation from './pages/NewSimulation/NewSimulation';
import History from './pages/History';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

const Comparison = lazy(() => import('./pages/Comparison'));

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="simulacao/nova" element={<NewSimulation />} />
        <Route
          path="comparacao/:id"
          element={
            <Suspense fallback={<Loading message="Carregando comparação..." />}>
              <Comparison />
            </Suspense>
          }
        />
        <Route path="historico" element={<History />} />
        <Route path="perfil" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
