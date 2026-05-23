import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitPullRequest, Plus, Check, X, GitMerge, Clock } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../store/authStore.js';

function PRList({ repoId, repoInfo, isOwner, onCreateNew }) {
  const { isAuthenticated, currentUser } = useAuth();
  const [prs, setPRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open'); // 'open', 'closed', 'merged'

  const fetchPRs = async () => {
    try {
      const res = await axiosInstance.get(`/pullrequest-api/repo/${repoId}/list?status=${filter}`);
      setPRs(res.data.payload || []);
    } catch (err) {
      console.error('Error fetching PRs', err);
      setPRs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPRs();
  }, [filter, repoId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return { bg: 'var(--success-subtle)', color: 'var(--success)', border: 'rgba(63,185,80,0.3)' };
      case 'closed':
        return { bg: 'var(--danger-subtle)', color: 'var(--danger)', border: 'rgba(248,81,73,0.3)' };
      case 'merged':
        return { bg: 'var(--purple-subtle)', color: 'var(--purple)', border: 'rgba(188,140,255,0.3)' };
      default:
        return { bg: 'var(--warning-subtle)', color: 'var(--warning)', border: 'rgba(210,153,34,0.3)' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'merged':
        return <GitMerge size={16} />;
      case 'closed':
        return <X size={16} />;
      default:
        return <GitPullRequest size={16} />;
    }
  };

  const statusBadge = (status) => {
    const c = getStatusColor(status);
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: 600,
        borderRadius: '12px',
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        textTransform: 'capitalize'
      }}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const filterBarStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-default)',
    paddingBottom: '12px'
  };

  const filterButtonStyle = (active) => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: active ? '600' : '500',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: active ? 'var(--accent-primary)' : 'var(--fg-muted)',
    borderBottom: active ? '2px solid var(--accent-primary)' : 'none',
    marginBottom: '-12px',
    transition: 'all var(--transition-fast)',
    fontFamily: 'inherit'
  });

  const prItemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-default)',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ ...prItemStyle, opacity: 0.5 }}>
            <div style={{ width: '18px', height: '18px', background: 'var(--bg-subtle)', borderRadius: '4px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '14px', background: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', background: 'var(--bg-subtle)', borderRadius: '4px', width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Filter Tabs */}
      <div style={filterBarStyle}>
        {['open', 'closed', 'merged'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={filterButtonStyle(filter === status)}
            onMouseEnter={(e) => {
              if (filter !== status) e.currentTarget.style.color = 'var(--fg-default)';
            }}
            onMouseLeave={(e) => {
              if (filter !== status) e.currentTarget.style.color = 'var(--fg-muted)';
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* PRs List */}
      {prs.length === 0 ? (
        <div style={{
          padding: '40px 24px',
          textAlign: 'center',
          border: '1px dashed var(--border-muted)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-subtle)'
        }}>
          <GitPullRequest size={40} style={{ color: 'var(--fg-subtle)', marginBottom: '12px' }} />
          <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--fg-muted)', marginBottom: '4px' }}>
            No {filter} pull requests
          </p>
          <p style={{ fontSize: '13px', color: 'var(--fg-subtle)' }}>
            {filter === 'open' ? 'Create a pull request to get started.' : `No ${filter} pull requests yet.`}
          </p>
        </div>
      ) : (
        prs.map(pr => (
          <Link
            key={pr._id}
            to={`/dashboard/repo/${repoId}/pr/${pr._id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div
              style={prItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-subtle)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-default)';
                e.currentTarget.style.borderColor = 'var(--border-muted)';
              }}
            >
              {/* Icon */}
              <div style={{
                color: pr.status === 'merged' ? 'var(--purple)' :
                       pr.status === 'closed' ? 'var(--danger)' :
                       'var(--success)',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {getStatusIcon(pr.status)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '6px'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--fg-default)',
                    margin: 0
                  }}>
                    {pr.title}
                  </h3>
                  {statusBadge(pr.status)}
                </div>

                <p style={{
                  fontSize: '12px',
                  color: 'var(--fg-muted)',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  <strong>#{pr._id.slice(-6)}</strong> opened {new Date(pr.createdAt).toLocaleDateString()} by{' '}
                  <strong>{pr.author?.name || 'Unknown'}</strong>
                </p>

                {pr.description && (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--fg-subtle)',
                    margin: '4px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    {pr.description.substring(0, 100)}{pr.description.length > 100 ? '...' : ''}
                  </p>
                )}

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '8px',
                  fontSize: '11px',
                  color: 'var(--fg-subtle)'
                }}>
                  {pr.changes && pr.changes.length > 0 && (
                    <span>{pr.changes.length} file{pr.changes.length !== 1 ? 's' : ''} changed</span>
                  )}
                  {pr.reviews && pr.reviews.length > 0 && (
                    <span>{pr.reviews.length} review{pr.reviews.length !== 1 ? 's' : ''}</span>
                  )}
                  {pr.comments && pr.comments.length > 0 && (
                    <span>{pr.comments.length} comment{pr.comments.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))
      )}

      {/* Create PR Button */}
      {isAuthenticated && (
        <button
          onClick={onCreateNew}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 20px',
            marginTop: '8px',
            fontSize: '13px',
            fontWeight: '600',
            background: 'var(--accent-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'opacity var(--transition-fast)',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={14} /> New pull request
        </button>
      )}
    </div>
  );
}

export default PRList;
