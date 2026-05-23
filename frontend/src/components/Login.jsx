import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Github, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../store/authStore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const isSubmittingRef = useRef(false);
  const [searchParams] = useSearchParams();

  // Pre-fill email if coming from signup
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmittingRef.current || loading) return;
    
    isSubmittingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const success = await authLogin({ email, password });
      if (success) {
        window.location.replace('/dashboard');
        return;
      } else {
        // Get error from auth store
        const authState = useAuth.getState();
        setError(authState.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
    fontSize: '14px', outline: 'none', transition: 'all var(--transition-fast)',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 'calc(100vh - 180px)',
      padding: '40px 16px',
      backgroundImage: 'var(--gradient-glow)',
      backgroundRepeat: 'no-repeat',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', color: 'var(--fg-default)' }}>
        <Github size={48} />
      </div>

      {/* Sign In Card */}
      <div className="animate-fade-in" style={{
        width: '100%', maxWidth: '340px', padding: '24px',
        background: 'var(--bg-default)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
      }}>
        <h1 style={{
          fontSize: '24px', fontWeight: 300, textAlign: 'center',
          marginBottom: '20px', color: 'var(--fg-default)',
        }}>Sign in to DevHub</h1>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', marginBottom: '16px', fontSize: '13px',
            color: 'var(--danger)', background: 'var(--danger-subtle)',
            border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius-md)',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--fg-default)' }}>
              Email address
            </label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--fg-default)' }}>Password</label>
              <a href="#" style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>Forgot password?</a>
            </div>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '10px', fontSize: '14px', fontWeight: 600,
            color: '#fff', background: loading ? 'var(--fg-subtle)' : 'var(--success)',
            border: 'none', borderRadius: 'var(--radius-md)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? 'Signing in...' : <>Sign in <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>

      {/* Register Link */}
      <div className="animate-fade-in" style={{
        width: '100%', maxWidth: '340px', marginTop: '16px', padding: '16px',
        background: 'var(--bg-default)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)', textAlign: 'center',
      }}>
        <p style={{ fontSize: '14px', color: 'var(--fg-default)' }}>
          New here?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>Create an account</Link>.
        </p>
      </div>
    </div>
  );
}

export default Login;