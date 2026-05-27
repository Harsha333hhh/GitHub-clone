import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Mail, User, Lock, FileText } from 'lucide-react';
import axios from 'axios';

// ProfileUpdateForm Component - All Settings on One Page
// Shows email, username, password, and bio updates simultaneously

const ProfileUpdateForm = ({ user, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState({
    email: { type: '', text: '' },
    username: { type: '', text: '' },
    password: { type: '', text: '' },
    bio: { type: '', text: '' }
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });

  // Email update state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  // Username update state
  const [usernameData, setUsernameData] = useState({
    newUsername: ''
  });

  // Password update state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  // Bio update state
  const [bioData, setBioData] = useState({
    bio: user?.bio || ''
  });

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password)) score += 1;

    let label = '';
    if (score === 0) label = 'No password';
    else if (score <= 2) label = 'Weak';
    else if (score <= 4) label = 'Medium';
    else label = 'Strong';

    return { score, label };
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score === 0) return 'var(--fg-muted)';
    if (passwordStrength.label === 'Weak') return '#f85149';
    if (passwordStrength.label === 'Medium') return '#d29922';
    if (passwordStrength.label === 'Strong') return '#3fb950';
    return 'var(--fg-muted)';
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!emailData.newEmail || !emailData.password) {
      setMessages({ ...messages, email: { type: 'error', text: 'Please fill in all fields' } });
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/user-api/update-email`, {
        newEmail: emailData.newEmail,
        password: emailData.password
      });
      setMessages({ ...messages, email: { type: 'success', text: 'Email updated successfully' } });
      setEmailData({ newEmail: '', password: '' });
      if (onUpdate) onUpdate({ ...user, email: emailData.newEmail });
    } catch (err) {
      setMessages({ ...messages, email: { type: 'error', text: err.response?.data?.message || 'Failed to update email' } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!usernameData.newUsername) {
      setMessages({ ...messages, username: { type: 'error', text: 'Please enter a username' } });
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/user-api/update-username`, {
        newUsername: usernameData.newUsername
      });
      setMessages({ ...messages, username: { type: 'success', text: 'Username updated successfully' } });
      setUsernameData({ newUsername: '' });
      if (onUpdate) onUpdate({ ...user, name: usernameData.newUsername });
    } catch (err) {
      setMessages({ ...messages, username: { type: 'error', text: err.response?.data?.message || 'Failed to update username' } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setMessages({ ...messages, password: { type: 'error', text: 'Please fill in all password fields' } });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessages({ ...messages, password: { type: 'error', text: 'New password must be at least 8 characters' } });
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/user-api/update-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessages({ ...messages, password: { type: 'success', text: 'Password updated successfully' } });
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMessages({ ...messages, password: { type: 'error', text: err.response?.data?.message || 'Failed to update password' } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/user-api/update-bio`, {
        bio: bioData.bio
      });
      setMessages({ ...messages, bio: { type: 'success', text: 'Bio updated successfully' } });
      if (onUpdate) onUpdate({ ...user, bio: bioData.bio });
    } catch (err) {
      setMessages({ ...messages, bio: { type: 'error', text: err.response?.data?.message || 'Failed to update bio' } });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-canvas)',
    color: 'var(--fg-default)',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all var(--transition-fast)'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '6px',
    color: 'var(--fg-default)'
  };

  const sectionStyle = {
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    marginBottom: '16px'
  };

  const MessageDisplay = ({ message }) => {
    if (!message.text) return null;
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        marginBottom: '12px',
        borderRadius: 'var(--radius-md)',
        background: message.type === 'success' ? 'var(--success-subtle)' : 'var(--danger-subtle)',
        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
        color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
        fontSize: '12px'
      }}>
        {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
        {message.text}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '20px',
        color: 'var(--fg-default)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        Account Settings
      </h2>

      {/* Email Section */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Mail size={16} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)' }}>Change Email</h3>
        </div>
        <MessageDisplay message={messages.email} />
        <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={labelStyle}>New Email</label>
            <input type="email" placeholder="newemail@example.com"
              value={emailData.newEmail}
              onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Password (for verification)</label>
            <input type="password" placeholder="Enter your password"
              value={emailData.password}
              onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
              style={inputStyle} />
          </div>
          <button type="submit" disabled={isLoading} style={{
            padding: '8px 12px', background: isLoading ? 'var(--fg-subtle)' : 'var(--accent-primary)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: '13px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1, transition: 'all var(--transition-fast)', fontFamily: 'inherit'
          }}>
            {isLoading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>

      {/* Username Section */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <User size={16} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)' }}>Change Username</h3>
        </div>
        <MessageDisplay message={messages.username} />
        <form onSubmit={handleUpdateUsername} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={labelStyle}>New Username</label>
            <input type="text" placeholder="newusername"
              value={usernameData.newUsername}
              onChange={(e) => setUsernameData({ newUsername: e.target.value })}
              style={inputStyle} />
            <small style={{ color: 'var(--fg-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              2-50 characters, alphanumeric and underscore/dash only
            </small>
          </div>
          <button type="submit" disabled={isLoading} style={{
            padding: '8px 12px', background: isLoading ? 'var(--fg-subtle)' : 'var(--accent-primary)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: '13px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1, transition: 'all var(--transition-fast)', fontFamily: 'inherit'
          }}>
            {isLoading ? 'Updating...' : 'Update Username'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Lock size={16} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)' }}>Change Password</h3>
        </div>
        <MessageDisplay message={messages.password} />
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input type="password" placeholder="Enter current password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input type="password" placeholder="Enter new password"
              value={passwordData.newPassword}
              onChange={(e) => {
                setPasswordData({ ...passwordData, newPassword: e.target.value });
                setPasswordStrength(calculatePasswordStrength(e.target.value));
              }}
              style={inputStyle} />
            
            {passwordData.newPassword && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  {[1, 2, 3].map((bar) => (
                    <div key={bar} style={{
                      height: '4px', flex: 1, borderRadius: '2px',
                      background: passwordStrength.score >= bar ? getPasswordStrengthColor() : 'var(--border-default)',
                      transition: 'all 0.2s'
                    }} />
                  ))}
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: getPasswordStrengthColor(),
                  whiteSpace: 'nowrap', minWidth: '50px'
                }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            <small style={{ color: 'var(--fg-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              Minimum 8 characters
            </small>
          </div>
          <button type="submit" disabled={isLoading} style={{
            padding: '8px 12px', background: isLoading ? 'var(--fg-subtle)' : 'var(--accent-primary)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: '13px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1, transition: 'all var(--transition-fast)', fontFamily: 'inherit'
          }}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Bio Section */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)' }}>Update Bio</h3>
        </div>
        <MessageDisplay message={messages.bio} />
        <form onSubmit={handleUpdateBio} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Bio <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea placeholder="Tell us about yourself..."
              value={bioData.bio}
              onChange={(e) => setBioData({ bio: e.target.value })}
              style={{
                ...inputStyle, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit'
              }} />
            <small style={{ color: 'var(--fg-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              {bioData.bio.length}/500 characters
            </small>
          </div>
          <button type="submit" disabled={isLoading} style={{
            padding: '8px 12px', background: isLoading ? 'var(--fg-subtle)' : 'var(--accent-primary)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: '13px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1, transition: 'all var(--transition-fast)', fontFamily: 'inherit'
          }}>
            {isLoading ? 'Updating...' : 'Update Bio'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;

  // Email update state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  // Username update state
  const [usernameData, setUsernameData] = useState({
    newUsername: ''
  });

  // Password update state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

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

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!emailData.newEmail || !emailData.password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/user-api/update-email`,
        {
          newEmail: emailData.newEmail,
          password: emailData.password
        }
      );

      setMessage({ type: 'success', text: 'Email updated successfully' });
      setEmailData({ newEmail: '', password: '' });
      if (onUpdate) onUpdate({ ...user, email: emailData.newEmail });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!usernameData.newUsername) {
      setMessage({ type: 'error', text: 'Please enter a username' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/user-api/update-username`,
        { newUsername: usernameData.newUsername }
      );

      setMessage({ type: 'success', text: 'Username updated successfully' });
      setUsernameData({ newUsername: '' });
      if (onUpdate) onUpdate({ ...user, name: usernameData.newUsername });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update username'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBio = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/user-api/update-bio`,
        { bio: bioData.bio }
      );

      setMessage({ type: 'success', text: 'Bio updated successfully' });
      if (onUpdate) onUpdate({ ...user, bio: bioData.bio });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update bio'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/user-api/update-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }
      );

      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-canvas)',
    color: 'var(--fg-default)',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all var(--transition-fast)'
  };

  const tabStyle = (isActive) => ({
    padding: '8px 16px',
    borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
    color: isActive ? 'var(--accent-primary)' : 'var(--fg-muted)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    transition: 'all var(--transition-fast)'
  });

  return (
    <div style={{
      background: 'var(--bg-default)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      maxWidth: '500px'
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 600,
        marginBottom: '24px',
        color: 'var(--fg-default)'
      }}>
        Account Settings
      </h2>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-default)',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('email')}
          style={tabStyle(activeTab === 'email')}
        >
          Email
        </button>
        <button
          onClick={() => setActiveTab('username')}
          style={tabStyle(activeTab === 'username')}
        >
          Username
        </button>
        <button
          onClick={() => setActiveTab('password')}
          style={tabStyle(activeTab === 'password')}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab('bio')}
          style={tabStyle(activeTab === 'bio')}
        >
          Bio
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          marginBottom: '16px',
          borderRadius: 'var(--radius-md)',
          background: message.type === 'success' ? 'var(--success-subtle)' : 'var(--danger-subtle)',
          border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
          fontSize: '13px'
        }}>
          {message.type === 'success' ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {message.text}
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '6px',
              color: 'var(--fg-default)'
            }}>
              New Email
            </label>
            <input
              type="email"
              placeholder="your.newemail@example.com"
              value={emailData.newEmail}
              onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '6px',
              color: 'var(--fg-default)'
            }}>
              Password (for verification)
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={emailData.password}
              onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isLoading ? 'var(--fg-subtle)' : 'var(--accent-primary)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all var(--transition-fast)'
            }}
          >
            {isLoading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      )}

      {/* Username Tab */}
      {activeTab === 'username' && (
        <form onSubmit={handleUpdateUsername} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '6px',
              color: 'var(--fg-default)'
            }}>
              New Username
            </label>
            <input
              type="text"
              placeholder="newusername"
              value={usernameData.newUsername}
              onChange={(e) => setUsernameData({ newUsername: e.target.value })}
              style={inputStyle}
            />
            <small style={{
              color: 'var(--fg-muted)',
              fontSize: '12px',
              marginTop: '4px',
              display: 'block'
            }}>
              2-50 characters, alphanumeric and underscore/dash only
            </small>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isLoading ? 'var(--fg-subtle)' : 'var(--accent-primary)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all var(--transition-fast)'
            }}
          >
            {isLoading ? 'Updating...' : 'Update Username'}
          </button>
        </form>
      )}

      {/* Bio Tab */}
      {activeTab === 'bio' && (
        <form onSubmit={handleUpdateBio} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '6px',
              color: 'var(--fg-default)'
            }}>
              Bio <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              placeholder="Tell us about yourself..."
              value={bioData.bio}
              onChange={(e) => setBioData({ bio: e.target.value })}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
            />
            <small style={{
              color: 'var(--fg-muted)',
              fontSize: '12px',
              marginTop: '4px',
              display: 'block'
            }}>
              {bioData.bio.length}/500 characters
            </small>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isLoading ? 'var(--fg-subtle)' : 'var(--accent-primary)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all var(--transition-fast)'
            }}
          >
            {isLoading ? 'Updating...' : 'Update Bio'}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '6px',
              color: 'var(--fg-default)'
            }}>
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter your current password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '6px',
              color: 'var(--fg-default)'
            }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter your new password"
              value={passwordData.newPassword}
              onChange={(e) => {
                setPasswordData({ ...passwordData, newPassword: e.target.value });
                setPasswordStrength(calculatePasswordStrength(e.target.value));
              }}
              style={inputStyle}
            />
            
            {/* Password Strength Indicator */}
            {passwordData.newPassword && (
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

            <small style={{
              color: 'var(--fg-muted)',
              fontSize: '12px',
              marginTop: '4px',
              display: 'block'
            }}>
              Minimum 8 characters
            </small>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isLoading ? 'var(--fg-subtle)' : 'var(--accent-primary)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all var(--transition-fast)'
            }}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileUpdateForm;
