import { Navigate } from 'react-router-dom';
import { getSessionUser } from '../utils/session';
import { getToken } from '../api/client';

export default function ProtectedRoute({ children }) {
  const session = getSessionUser();

  const isAuthenticated =
    Boolean(getToken()) &&
    session !== null &&
    session.expiresAt !== null &&
    session.expiresAt > new Date();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
