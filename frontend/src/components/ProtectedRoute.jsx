import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

function ProtectedRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give the auth store a moment to sync with localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, currentUser]);

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
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
