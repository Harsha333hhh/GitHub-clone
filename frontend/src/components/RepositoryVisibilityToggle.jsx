import React, { useState } from 'react';
import { Lock, Globe } from 'lucide-react';
import axios from 'axios';

// RepositoryVisibilityToggle Component
// Allows repository owners to toggle between public and private visibility
// Shows current visibility status with icon and button to change

const RepositoryVisibilityToggle = ({ repository, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isPublic = repository?.visibility === 'public';
  const isOwner = repository?.owner?._id === localStorage.getItem('userId'); // or use auth context

  const handleToggleVisibility = async () => {
    if (!isOwner) return; // Prevent non-owners from toggling

    setIsLoading(true);
    setError('');

    try {
      const newVisibility = isPublic ? 'private' : 'public';
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/repository-api/repositories/${repository._id}/visibility`,
        { visibility: newVisibility }
      );

      // Update parent component
      if (onUpdate) {
        onUpdate({
          ...repository,
          visibility: newVisibility
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update visibility');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner) {
    // Show read-only status for non-owners
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-subtle)',
        color: 'var(--fg-muted)',
        fontSize: '12px',
        fontWeight: 500
      }}>
        {isPublic ? (
          <>
            <Globe size={14} />
            <span>Public</span>
          </>
        ) : (
          <>
            <Lock size={14} />
            <span>Private</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <button
          onClick={handleToggleVisibility}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            background: isPublic ? 'var(--bg-success-subtle)' : 'var(--bg-danger-subtle)',
            color: isPublic ? 'var(--success)' : 'var(--danger)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.background = isPublic ? 'var(--success)' : 'var(--danger)';
              e.target.style.color = '#fff';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = isPublic ? 'var(--bg-success-subtle)' : 'var(--bg-danger-subtle)';
            e.target.style.color = isPublic ? 'var(--success)' : 'var(--danger)';
          }}
        >
          {isPublic ? (
            <>
              <Globe size={14} />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock size={14} />
              <span>Private</span>
            </>
          )}
        </button>
        
        <span style={{
          fontSize: '11px',
          color: 'var(--fg-muted)',
          fontWeight: 400
        }}>
          Click to {isPublic ? 'make private' : 'make public'}
        </span>
      </div>

      {error && (
        <div style={{
          fontSize: '11px',
          color: 'var(--danger)',
          padding: '4px 8px',
          background: 'var(--danger-subtle)',
          borderRadius: 'var(--radius-sm)'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default RepositoryVisibilityToggle;
