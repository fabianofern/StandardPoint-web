import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import AccessDenied from './AccessDenied';

const ProtectedLayout = ({ children }) => {
  const { isChecking, isAuthenticated, hasToolAccess, setAuth, setUnauthenticated } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/me');
        if (response.data && response.data.user) {
          setAuth(response.data.user);
        }
      } catch (error) {
        // The interceptor will handle 401/403 redirects and store updates
        if (error.response && error.response.status !== 401 && error.response.status !== 403) {
            console.error('Failed to check auth status', error);
            setUnauthenticated();
        }
      }
    };

    checkAuth();
  }, [setAuth, setUnauthenticated]);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#2c3e50', color: '#fff', fontFamily: 'sans-serif' }}>
        <h2>Carregando Aplicação...</h2>
      </div>
    );
  }

  if (isAuthenticated && !hasToolAccess) {
    return <AccessDenied />;
  }

  // If not authenticated, the interceptor will have already redirected them.
  // We return null here just to prevent flashing content while the redirect matches.
  if (!isAuthenticated) {
    return null; 
  }

  return <>{children}</>;
};

export default ProtectedLayout;
