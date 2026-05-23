import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitPullRequest, Check, X, Clock, Send, Inbox, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../store/authStore.js';

function PullRequests() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('received');
  const [sentPRs, setSentPRs] = useState([]);
  const [receivedPRs, setReceivedPRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPRs = async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    try {
      setError(null);
      const [sentRes, receivedRes] = await Promise.all([
        axiosInstance.get('/pullrequest-api/sent'),
        axiosInstance.get('/pullrequest-api/received'),
      ]);
      setSentPRs(sentRes.data.payload || []);
      setReceivedPRs(receivedRes.data.payload || []);
    } catch (err) {
      console.error('Error fetching PRs', err);
      setError(err.response?.data?.message || 'Failed to fetch pull requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPRs(); 
  }, [isAuthenticated]);

  const handleAction = async (prId, action) => {
    try {
      await axiosInstance.put(`/pullrequest-api/${prId}/${action}`);
      await fetchPRs();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action}`);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      pending: { bg: 'var(--warning-subtle)', color: 'var(--warning)', border: 'rgba(210,153,34,0.3)' },
      open: { bg: 'var(--warning-subtle)', color: 'var(--warning)', border: 'rgba(210,153,34,0.3)' },
      approved: { bg: 'var(--success-subtle)', color: 'var(--success)', border: 'rgba(63,185,80,0.3)' },
      rejected: { bg: 'var(--danger-subtle)', color: 'var(--danger)', border: 'rgba(248,81,73,0.3)' },
    };
    const c = colors[status] || colors.pending;
    return (
      <span style={{
        padding: '2px 10px', fontSize: '11px', fontWeight: 600,
        borderRadius: '12px', background: c.bg, color: c.color,
        border: `1px solid ${c.border}`, textTransform: 'capitalize',
      }}>{status}</span>
    );
  };

  const prs = tab === 'sent' ? sentPRs : receivedPRs;

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <GitPullRequest size={48} style={{ color: 'var(--fg-subtle)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--fg-default)', marginBottom: '8px' }}>Pull Requests</h2>
        <p style={{ fontSize: '14px', color: 'var(--fg-muted)', marginBottom: '24px' }}>Sign in to view your pull requests</p>
        <Link to="/login" style={{
          display: 'inline-block', padding: '10px 24px', background: 'var(--accent-emphasis)',
          color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px',
        }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <GitPullRequest size={24} style={{ color: 'var(--accent-primary)' }} />
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--fg-default)' }}>Pull Requests</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: '16px', padding: '12px 16px',
          background: 'var(--danger-subtle)', border: '1px solid rgba(248,81,73,0.3)',
          borderRadius: 'var(--radius-md)', color: 'var(--danger)',
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0', marginBottom: '0',
        borderBottom: '1px solid var(--border-default)',
      }}>
        {[
          { key: 'received', label: 'Received', icon: <Inbox size={14} />, count: receivedPRs.length },
          { key: 'sent', label: 'Sent', icon: <Send size={14} />, count: sentPRs.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', fontSize: '14px', fontWeight: tab === t.key ? 600 : 400,
            background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t.key ? 'var(--fg-default)' : 'var(--fg-muted)',
            borderBottom: tab === t.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'all var(--transition-fast)', fontFamily: 'inherit',
            marginBottom: '-1px',
          }}>
            {t.icon} {t.label}
            <span style={{
              padding: '0 7px', fontSize: '11px', fontWeight: 600,
              background: 'var(--bg-subtle)', borderRadius: '10px',
              color: 'var(--fg-muted)',
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* PR List */}
      <div style={{
        border: '1px solid var(--border-default)', borderTop: 'none',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        overflow: 'hidden', background: 'var(--bg-default)',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-subtle)' }}>Loading pull requests...</div>
        ) : prs.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <GitPullRequest size={40} style={{ color: 'var(--fg-subtle)', marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', color: 'var(--fg-muted)', fontWeight: 500, marginBottom: '6px' }}>
              No {tab} pull requests
            </p>
            <p style={{ fontSize: '13px', color: 'var(--fg-subtle)' }}>
              {tab === 'sent'
                ? 'Request access to a repository to see it here.'
                : 'When someone requests access to your repositories, it will appear here.'}
            </p>
          </div>
        ) : (
          prs.map((pr, i) => (
            <div key={pr._id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 20px',
              borderBottom: i < prs.length - 1 ? '1px solid var(--border-muted)' : 'none',
              transition: 'background var(--transition-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <GitPullRequest size={18} style={{
                color: pr.status === 'approved' ? 'var(--success)' :
                       pr.status === 'rejected' ? 'var(--danger)' : 'var(--warning)',
                flexShrink: 0,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)' }}>
                    {pr.repository?.title || 'Unknown Repo'}
                  </span>
                  {statusBadge(pr.status)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                  {tab === 'received' ? (
                    <>
                      <img src={pr.from?.profileImage || pr.author?.profileImage} alt="" style={{ width: '14px', height: '14px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '4px' }} />
                      <strong>{pr.from?.name || pr.author?.name}</strong> requested access
                    </>
                  ) : (
                    <>Sent to <strong>{pr.to?.name}</strong></>
                  )}
                  {' · '}
                  {new Date(pr.createdAt).toLocaleDateString()}
                </div>
                {pr.message && (
                  <p style={{ fontSize: '12px', color: 'var(--fg-subtle)', marginTop: '4px', fontStyle: 'italic' }}>
                    "{pr.message}"
                  </p>
                )}
              </div>

              {/* Actions — only for received + pending/open status */}
              {tab === 'received' && (pr.status === 'pending' || pr.status === 'open') && (
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => handleAction(pr._id, 'approve')} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                    background: 'var(--success)', border: 'none',
                    borderRadius: 'var(--radius-md)', color: '#fff',
                    cursor: 'pointer', transition: 'opacity var(--transition-fast)',
                    fontFamily: 'inherit',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => handleAction(pr._id, 'reject')} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                    background: 'var(--danger-subtle)', border: '1px solid rgba(248,81,73,0.3)',
                    borderRadius: 'var(--radius-md)', color: 'var(--danger)',
                    cursor: 'pointer', transition: 'opacity var(--transition-fast)',
                    fontFamily: 'inherit',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PullRequests;

  const handleAction = async (prId, action) => {
    try {
      await axiosInstance.put(`/pullrequest-api/${prId}/${action}`);
      await fetchPRs();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action}`);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      pending: { bg: 'var(--warning-subtle)', color: 'var(--warning)', border: 'rgba(210,153,34,0.3)' },
      approved: { bg: 'var(--success-subtle)', color: 'var(--success)', border: 'rgba(63,185,80,0.3)' },
      rejected: { bg: 'var(--danger-subtle)', color: 'var(--danger)', border: 'rgba(248,81,73,0.3)' },
    };
    const c = colors[status] || colors.pending;
    return (
      <span style={{
        padding: '2px 10px', fontSize: '11px', fontWeight: 600,
        borderRadius: '12px', background: c.bg, color: c.color,
        border: `1px solid ${c.border}`, textTransform: 'capitalize',
      }}>{status}</span>
    );
  };

  const prs = tab === 'sent' ? sentPRs : receivedPRs;

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <GitPullRequest size={48} style={{ color: 'var(--fg-subtle)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--fg-default)', marginBottom: '8px' }}>Pull Requests</h2>
        <p style={{ fontSize: '14px', color: 'var(--fg-muted)', marginBottom: '24px' }}>Sign in to view your pull requests</p>
        <Link to="/login" style={{
          display: 'inline-block', padding: '10px 24px', background: 'var(--accent-emphasis)',
          color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px',
        }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <GitPullRequest size={24} style={{ color: 'var(--accent-primary)' }} />
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--fg-default)' }}>Pull Requests</h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0', marginBottom: '0',
        borderBottom: '1px solid var(--border-default)',
      }}>
        {[
          { key: 'received', label: 'Received', icon: <Inbox size={14} />, count: receivedPRs.length },
          { key: 'sent', label: 'Sent', icon: <Send size={14} />, count: sentPRs.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', fontSize: '14px', fontWeight: tab === t.key ? 600 : 400,
            background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t.key ? 'var(--fg-default)' : 'var(--fg-muted)',
            borderBottom: tab === t.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'all var(--transition-fast)', fontFamily: 'inherit',
            marginBottom: '-1px',
          }}>
            {t.icon} {t.label}
            <span style={{
              padding: '0 7px', fontSize: '11px', fontWeight: 600,
              background: 'var(--bg-subtle)', borderRadius: '10px',
              color: 'var(--fg-muted)',
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* PR List */}
      <div style={{
        border: '1px solid var(--border-default)', borderTop: 'none',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        overflow: 'hidden', background: 'var(--bg-default)',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-subtle)' }}>Loading...</div>
        ) : prs.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <GitPullRequest size={40} style={{ color: 'var(--fg-subtle)', marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', color: 'var(--fg-muted)', fontWeight: 500, marginBottom: '6px' }}>
              No {tab} pull requests
            </p>
            <p style={{ fontSize: '13px', color: 'var(--fg-subtle)' }}>
              {tab === 'sent'
                ? 'Request access to a repository to see it here.'
                : 'When someone requests access to your repositories, it will appear here.'}
            </p>
          </div>
        ) : (
          prs.map((pr, i) => (
            <div key={pr._id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 20px',
              borderBottom: i < prs.length - 1 ? '1px solid var(--border-muted)' : 'none',
              transition: 'background var(--transition-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <GitPullRequest size={18} style={{
                color: pr.status === 'approved' ? 'var(--success)' :
                       pr.status === 'rejected' ? 'var(--danger)' : 'var(--warning)',
                flexShrink: 0,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)' }}>
                    {pr.repository?.title || 'Unknown Repo'}
                  </span>
                  {statusBadge(pr.status)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                  {tab === 'received' ? (
                    <>
                      <img src={pr.from?.profileImage} alt="" style={{ width: '14px', height: '14px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '4px' }} />
                      <strong>{pr.from?.name}</strong> requested access
                    </>
                  ) : (
                    <>Sent to <strong>{pr.to?.name}</strong></>
                  )}
                  {' · '}
                  {new Date(pr.createdAt).toLocaleDateString()}
                </div>
                {pr.message && (
                  <p style={{ fontSize: '12px', color: 'var(--fg-subtle)', marginTop: '4px', fontStyle: 'italic' }}>
                    "{pr.message}"
                  </p>
                )}
              </div>

              {/* Actions — only for received + pending */}
              {tab === 'received' && pr.status === 'pending' && (
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => handleAction(pr._id, 'approve')} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                    background: 'var(--success)', border: 'none',
                    borderRadius: 'var(--radius-md)', color: '#fff',
                    cursor: 'pointer', transition: 'opacity var(--transition-fast)',
                    fontFamily: 'inherit',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => handleAction(pr._id, 'reject')} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                    background: 'var(--danger-subtle)', border: '1px solid rgba(248,81,73,0.3)',
                    borderRadius: 'var(--radius-md)', color: 'var(--danger)',
                    cursor: 'pointer', transition: 'opacity var(--transition-fast)',
                    fontFamily: 'inherit',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PullRequests;
