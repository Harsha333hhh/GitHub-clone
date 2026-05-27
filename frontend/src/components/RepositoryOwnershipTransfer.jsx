import React, { useState } from 'react';
import { Share2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

// RepositoryOwnershipTransfer Component
// Allows repository owners to transfer ownership to another user
// Requires target user email and confirmation

const RepositoryOwnershipTransfer = ({ repository, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newOwnerId, setNewOwnerId] = useState('');

  const handleSearchUser = async () => {
    if (!newOwnerEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Search for user by email
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user-api/search?email=${encodeURIComponent(newOwnerEmail)}`
      );

      if (response.data.payload) {
        setNewOwnerId(response.data.payload._id);
        setMessage({ 
          type: 'success', 
          text: `Found user: ${response.data.payload.name}` 
        });
      } else {
        setMessage({ type: 'error', text: 'User not found' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to search for user'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!newOwnerId) {
      setMessage({ type: 'error', text: 'Please search for and select a user first' });
      return;
    }

    if (!window.confirm('Are you sure? This action cannot be undone. The new owner will have full control of this repository.')) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/user-api/transfer-ownership/${repository._id}/${newOwnerId}`
      );

      setMessage({ 
        type: 'success', 
        text: 'Ownership transferred successfully!' 
      });
      
      if (onUpdate) {
        onUpdate(response.data.repository);
      }

      // Reset form after successful transfer
      setTimeout(() => {
        setNewOwnerEmail('');
        setNewOwnerId('');
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to transfer ownership'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-default)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      marginTop: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isOpen ? '16px' : '0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--fg-default)',
          fontSize: '14px',
          fontWeight: 600
        }}>
          <Share2 size={16} />
          Transfer Ownership
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 600,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--fg-default)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--fg-subtle)';
            e.target.style.background = 'var(--bg-canvas)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--border-default)';
            e.target.style.background = 'var(--bg-subtle)';
          }}
        >
          {isOpen ? 'Hide' : 'Show'}
        </button>
      </div>

      {isOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-default)'
        }}>
          <p style={{
            fontSize: '12px',
            color: 'var(--fg-muted)',
            lineHeight: 1.6
          }}>
            Transfer this repository to another user. The new owner will have full control and you will lose ownership rights.
          </p>

          {message.text && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: message.type === 'success' ? 'var(--success-subtle)' : 'var(--danger-subtle)',
              border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              fontSize: '12px'
            }}>
              {message.type === 'success' ? (
                <CheckCircle size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              {message.text}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="email"
              placeholder="Enter new owner's email"
              value={newOwnerEmail}
              onChange={(e) => setNewOwnerEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-canvas)',
                color: 'var(--fg-default)',
                outline: 'none',
                transition: 'all var(--transition-fast)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-primary)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-default)';
              }}
            />
            <button
              onClick={handleSearchUser}
              disabled={isLoading || !newOwnerEmail}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                background: isLoading || !newOwnerEmail ? 'var(--fg-subtle)' : 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: isLoading || !newOwnerEmail ? 'not-allowed' : 'pointer',
                opacity: isLoading || !newOwnerEmail ? 0.6 : 1,
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap'
              }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {newOwnerId && (
            <button
              onClick={handleTransferOwnership}
              disabled={isLoading}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                background: isLoading ? 'var(--fg-subtle)' : 'var(--danger)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all var(--transition-fast)',
                width: '100%'
              }}
            >
              {isLoading ? 'Transferring...' : 'Confirm Transfer'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoryOwnershipTransfer;
