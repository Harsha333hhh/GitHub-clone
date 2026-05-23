import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

function ProtectedRoute({ children }) {
  const { isAuthenticated, currentUser, syncAuthState } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Sync auth state with localStorage on mount
    syncAuthState();
    
    // Give the auth store a moment to sync with localStorage and verify token
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [syncAuthState]);

  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--fg-subtle)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-default)',
            borderTop: '3px solid var(--accent-emphasis)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}></div>
          <p>Loading...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    console.warn('User not authenticated, redirecting to login');
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

  return children;
}

export default ProtectedRoute;
