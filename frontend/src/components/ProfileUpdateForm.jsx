import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

// ProfileUpdateForm Component
// Allows users to update their email, username, and bio
// Includes validation and security checks (password verification for email)

const ProfileUpdateForm = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('email'); // 'email', 'username', 'bio'
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Email update state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  // Username update state
  const [usernameData, setUsernameData] = useState({
    newUsername: ''
  });

  // Bio update state
  const [bioData, setBioData] = useState({
    bio: user?.bio || ''
  });

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
        borderBottom: '1px solid var(--border-default)'
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
    </div>
  );
};

export default ProfileUpdateForm;
