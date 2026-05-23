import React, { useState } from 'react';
import { Mail, UserPlus, Trash2, Users, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';

function Collaborate({ repoId, repoInfo, isOwner, onCollaboratorsUpdate }) {
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [removing, setRemoving] = useState(null);

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setAdding(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axiosInstance.post(`/repository-api/repositories/${repoId}/collaborators`, {
        email: email.trim().toLowerCase()
      });

      setMessage({ type: 'success', text: `${email} has been added as a collaborator!` });
      setEmail('');

      // Update collaborators list
      if (onCollaboratorsUpdate) {
        onCollaboratorsUpdate(res.data.payload.collaborators);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add collaborator';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;

    setRemoving(collaboratorId);
    setMessage({ type: '', text: '' });

    try {
      const res = await axiosInstance.delete(
        `/repository-api/repositories/${repoId}/collaborators/${collaboratorId}`
      );

      setMessage({ type: 'success', text: 'Collaborator removed successfully' });

      // Update collaborators list
      if (onCollaboratorsUpdate) {
        onCollaboratorsUpdate(res.data.payload.collaborators);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove collaborator';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setRemoving(null);
    }
  };

  const collaborators = repoInfo?.collaborators || [];

  const containerStyle = {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '32px 24px'
  };

  const sectionStyle = {
    marginBottom: '32px'
  };

  const cardStyle = {
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--bg-default)',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  };

  const headerStyle = {
    padding: '16px',
    background: 'var(--bg-subtle)',
    borderBottom: '1px solid var(--border-default)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--fg-default)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    fontFamily: 'inherit'
  };

  const buttonStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    background: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap'
  };

  const messageStyle = {
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: message.type === 'error' ? '1px solid rgba(248,81,73,0.3)' : '1px solid rgba(63,185,80,0.3)',
    background: message.type === 'error' ? 'var(--danger-subtle)' : 'var(--success-subtle)',
    color: message.type === 'error' ? 'var(--danger)' : 'var(--success)'
  };

  const collaboratorItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-muted)',
    transition: 'background var(--transition-fast)',
    cursor: 'pointer'
  };

  const collaboratorInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--bg-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--fg-default)',
    overflow: 'hidden'
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      {/* Add People Section (Owner Only) */}
      {isOwner && (
        <div style={sectionStyle}>
          <div style={cardStyle}>
            <div style={headerStyle}>
              <UserPlus size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--fg-default)' }}>
                Add People
              </span>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{
                fontSize: '13px',
                color: 'var(--fg-muted)',
                marginBottom: '16px'
              }}>
                Grant write access to your repository. Enter the email address of the person you want to collaborate with.
              </p>

              {message.text && (
                <div style={messageStyle}>
                  {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                  {message.text}
                </div>
              )}

              <form onSubmit={handleAddCollaborator} style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--fg-subtle)',
                    pointerEvents: 'none'
                  }} />
                  <input
                    type="email"
                    placeholder="Enter email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-primary)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-default)';
                      e.target.style.boxShadow = 'none';
                    }}
                    style={{
                      ...inputStyle,
                      paddingLeft: '36px'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={adding}
                  onClick={handleAddCollaborator}
                  style={{
                    ...buttonStyle,
                    opacity: adding ? 0.7 : 1,
                    cursor: adding ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!adding) e.currentTarget.style.opacity = '0.85';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = adding ? '0.7' : '1';
                  }}
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Collaborators List Section */}
      <div style={sectionStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <Users size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--fg-default)' }}>
              Collaborators ({collaborators.length})
            </span>
          </div>

          {collaborators.length > 0 ? (
            <div>
              {collaborators.map((collab, index) => (
                <div
                  key={collab._id || index}
                  style={{
                    ...collaboratorItemStyle,
                    borderBottom: index < collaborators.length - 1 ? '1px solid var(--border-muted)' : 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={collaboratorInfoStyle}>
                    <div style={avatarStyle}>
                      {collab.profileImage && collab.profileImage.includes('pixabay') ? (
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: 'var(--fg-subtle)'
                        }}>
                          {collab.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <img
                          src={collab.profileImage}
                          alt={collab.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--fg-default)'
                      }}>
                        {collab.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--fg-subtle)'
                      }}>
                        {collab.email}
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => handleRemoveCollaborator(collab._id)}
                      disabled={removing === collab._id}
                      title="Remove collaborator"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '6px',
                        background: 'none',
                        border: 'none',
                        cursor: removing === collab._id ? 'not-allowed' : 'pointer',
                        color: 'var(--fg-subtle)',
                        borderRadius: '4px',
                        transition: 'color var(--transition-fast)',
                        opacity: removing === collab._id ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (removing !== collab._id) e.currentTarget.style.color = 'var(--danger)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--fg-subtle)';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '40px 16px',
              textAlign: 'center',
              color: 'var(--fg-subtle)'
            }}>
              <Users size={32} style={{
                margin: '0 auto 12px',
                color: 'var(--fg-subtle)',
                opacity: 0.5
              }} />
              <p style={{ fontSize: '14px', fontWeight: '500' }}>
                No collaborators yet
              </p>
              <p style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                {isOwner ? 'Add people to collaborate on this repository' : 'Only the owner can add collaborators'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Owner Information Section */}
      {repoInfo?.owner && (
        <div style={sectionStyle}>
          <div style={cardStyle}>
            <div style={headerStyle}>
              <UserPlus size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--fg-default)' }}>
                Repository Owner
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px'
            }}>
              <div style={avatarStyle}>
                {repoInfo.owner.profileImage && repoInfo.owner.profileImage.includes('pixabay') ? (
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--fg-subtle)'
                  }}>
                    {repoInfo.owner.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <img
                    src={repoInfo.owner.profileImage}
                    alt={repoInfo.owner.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--fg-default)'
                }}>
                  {repoInfo.owner.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--fg-subtle)'
                }}>
                  {repoInfo.owner.email}
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <span style={{
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                background: 'var(--accent-primary)',
                color: '#fff',
                borderRadius: '12px'
              }}>
                Owner
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Collaborate;
