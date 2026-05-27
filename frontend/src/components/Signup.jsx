import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Github, UserPlus, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../store/authStore';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });
  const { completeSignup } = useAuth();
  const isSubmittingRef = useRef(false);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    
    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character type checks
    if (/[a-z]/.test(password)) score += 1;  // lowercase
    if (/[A-Z]/.test(password)) score += 1;  // uppercase
    if (/\d/.test(password)) score += 1;     // number
    if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password)) score += 1;  // special char

    let label = '';
    if (score === 0) label = 'No password';
    else if (score <= 2) label = 'Weak';
    else if (score <= 4) label = 'Medium';
    else label = 'Strong';

    return { score, label };
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score === 0) return 'var(--fg-muted)';
    if (passwordStrength.label === 'Weak') return '#f85149';     // red
    if (passwordStrength.label === 'Medium') return '#d29922';   // yellow
    if (passwordStrength.label === 'Strong') return '#3fb950';   // green
    return 'var(--fg-muted)';
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmittingRef.current || loading) return;
    
    isSubmittingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/user-api/users', formData);
      const user = response.data.user || response.data.payload;
      completeSignup(user);
      // Redirect to login with pre-filled email
      window.location.replace(`/login?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Calculate password strength if password field changed
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
    fontSize: '14px', outline: 'none', transition: 'all var(--transition-fast)',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    marginBottom: '6px', color: 'var(--fg-default)',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 'calc(100vh - 180px)',
      padding: '40px 16px',
      backgroundImage: 'var(--gradient-glow)',
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{ marginBottom: '32px', color: 'var(--fg-default)' }}>
        <Github size={48} />
      </div>

      <div className="animate-fade-in" style={{
        width: '100%', maxWidth: '440px', padding: '32px',
        background: 'var(--bg-default)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
      }}>
        <h1 style={{
          fontSize: '24px', fontWeight: 300, textAlign: 'center',
          marginBottom: '32px', color: 'var(--fg-default)',
        }}>Join DevHub</h1>

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

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input type="text" name="name" placeholder="Your name"
              onChange={handleChange} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
              required />
          </div>

          <div>
            <label style={labelStyle}>Email address *</label>
            <input type="email" name="email" placeholder="you@example.com"
              onChange={handleChange} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
              required />
          </div>

          <div>
            <label style={labelStyle}>Password *</label>
            <input type="password" name="password" placeholder="Min 8 characters"
              onChange={handleChange} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
              required />
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Strength bars */}
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  {[1, 2, 3].map((bar) => (
                    <div
                      key={bar}
                      style={{
                        height: '4px',
                        flex: 1,
                        borderRadius: '2px',
                        background: passwordStrength.score >= bar ? getPasswordStrengthColor() : 'var(--border-default)',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
                
                {/* Strength label */}
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: getPasswordStrengthColor(),
                  whiteSpace: 'nowrap',
                  minWidth: '60px'
                }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Bio <span style={{ color: 'var(--fg-subtle)', fontWeight: 400 }}>(optional)</span></label>
            <textarea name="bio" rows="3" placeholder="Tell us about yourself..."
              onChange={handleChange}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
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
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--fg-muted)', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Sign in</Link>
      </p>
    </div>
  );
}

export default Signup;