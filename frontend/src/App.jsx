import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useAuth } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Layout
import RootLayout from './components/RootLayout';
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import CreateRepo from './components/CreateRepo';
import Profile from './components/Profile';
import Home from './components/Home';
import PullRequests from './components/PullRequests';
import Issues from './components/Issues';
import Marketplace from './components/Marketplace';
import Customization from './components/Customization';

// Error Page
const ErrorPage = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', color: 'var(--fg-default)',
  }}>
    <h1 className="text-gradient" style={{ fontSize: '72px', fontWeight: 800, marginBottom: '8px' }}>404</h1>
    <p style={{ fontSize: '16px', color: 'var(--fg-muted)', marginBottom: '24px' }}>
      This is not the page you are looking for.
    </p>
    <a href="/" style={{
      padding: '8px 20px', background: 'var(--accent-emphasis)',
      color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 600,
      fontSize: '14px', textDecoration: 'none',
      transition: 'opacity var(--transition-fast)',
    }}>Take me home</a>
  </div>
);

function App() {
  const RepoExplorer = React.lazy(() => import('./components/RepoExplorer'));
  const FileViewer = React.lazy(() => import('./components/FileViewer'));
  const { syncAuthState } = useAuth();
  const { initializeTheme } = useThemeStore();

  // Sync auth state with localStorage on app mount
  useEffect(() => {
    syncAuthState();
  }, [syncAuthState]);

  // Apply the saved theme on app mount
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <PublicLayout />,
      children: [
        {
          index: true,
          element: <Landing />
        },
        {
          path: "login",
          element: <Login />
        },
        {
          path: "signup",
          element: <Signup />
        }
      ]
    },
    {
      path: "/dashboard",
      element: <RootLayout />, 
      errorElement: <RootLayout><ErrorPage /></RootLayout>, 
      children: [
        {
          index: true,
          element: <ProtectedRoute><Dashboard /></ProtectedRoute>
        },
        {
          path: "new",
          element: <ProtectedRoute><CreateRepo /></ProtectedRoute>
        },
        {
          path: "explore",
          element: <ProtectedRoute><Home /></ProtectedRoute>
        },
        {
          path: "pulls",
          element: <ProtectedRoute><PullRequests /></ProtectedRoute>
        },
        {
          path: "issues",
          element: <ProtectedRoute><Issues /></ProtectedRoute>
        },
        {
          path: "marketplace",
          element: <ProtectedRoute><Marketplace /></ProtectedRoute>
        },
        {
          path: "profile/:username",
          element: <ProtectedRoute><Profile /></ProtectedRoute>
        },
        {
          path: "customization",
          element: <ProtectedRoute><Customization /></ProtectedRoute>
        },
        {
          path: "repo/:repoId",
          element: (
            <ProtectedRoute>
              <React.Suspense fallback={
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--fg-subtle)' }}>
                  Loading repository...
                </div>
              }>
                <RepoExplorer />
              </React.Suspense>
            </ProtectedRoute>
          )
        },
        {
          path: "repo/:repoId/blob/*",
          element: (
            <ProtectedRoute>
              <React.Suspense fallback={
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--fg-subtle)' }}>
                  Loading file...
                </div>
              }>
                <FileViewer />
              </React.Suspense>
            </ProtectedRoute>
          )
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;