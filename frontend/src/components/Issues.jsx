import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CircleDot, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../store/authStore.js';

function Issues() {
  const { repoId } = useParams();
  const { isAuthenticated, currentUser } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, [filter, repoId]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/issue-api/${repoId || 'all'}/issues`);
      let fetchedIssues = res.data || [];
      
      // Filter by status
      if (filter !== 'all' && Array.isArray(fetchedIssues)) {
        fetchedIssues = fetchedIssues.filter(issue => 
          (filter === 'open' && issue.status !== 'closed') ||
          (filter === 'closed' && issue.status === 'closed')
        );
      }
      
      setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setIssues([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!formData.title.trim()) {
      alert('Please enter an issue title');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = repoId ? `/issue-api/${repoId}/issues` : '/issue-api/general/issues';
      await axiosInstance.post(endpoint, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        author: currentUser?._id,
        status: 'open'
      });

      // Reset form and refresh
      setFormData({ title: '', description: '', priority: 'medium' });
      setShowForm(false);
      await fetchIssues();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'closed':
        return <CheckCircle size={16} />;
      default:
        return <CircleDot size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'closed':
        return 'var(--danger)';
      default:
        return 'var(--success)';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return 'var(--danger)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--fg-muted)';
    }
  };

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '960px', margin: '0 auto', padding: '48px 24px',
    }}>
      <div style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--fg-default)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <CircleDot size={24} style={{ color: 'var(--success)' }} />
          Issues
        </h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', background: 'var(--accent-emphasis)', color: '#fff',
              borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px',
              border: 'none', cursor: 'pointer', transition: 'opacity var(--transition-fast)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={16} /> New Issue
          </button>
        )}
      </div>

      {showForm && (
        <div style={{
          padding: '20px', background: 'var(--bg-default)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)', marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--fg-default)', marginBottom: '16px' }}>Create New Issue</h3>
          
          <input
            type="text"
            placeholder="Issue title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            style={{
              width: '100%', padding: '10px 14px', fontSize: '14px',
              background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
              marginBottom: '12px', fontFamily: 'inherit', outline: 'none'
            }}
          />
          
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            style={{
              width: '100%', padding: '10px 14px', fontSize: '14px',
              background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
              marginBottom: '12px', fontFamily: 'inherit', outline: 'none', minHeight: '100px', resize: 'vertical'
            }}
          />

          <select
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
            style={{
              padding: '8px 12px', fontSize: '14px',
              background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
              marginBottom: '16px', fontFamily: 'inherit', cursor: 'pointer'
            }}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCreateIssue}
              disabled={submitting}
              style={{
                padding: '8px 16px', background: 'var(--success)', color: '#fff',
                borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1, transition: 'opacity var(--transition-fast)',
                fontFamily: 'inherit'
              }}
            >
              {submitting ? 'Creating...' : 'Create Issue'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '8px 16px', background: 'var(--bg-canvas)', color: 'var(--fg-default)',
                borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px',
                border: '1px solid var(--border-default)', cursor: 'pointer',
                transition: 'all var(--transition-fast)', fontFamily: 'inherit'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '16px',
        borderBottom: '1px solid var(--border-muted)', paddingBottom: '12px'
      }}>
        {['open', 'closed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: filter === status ? '600' : '500',
              background: 'none', border: 'none', cursor: 'pointer',
              color: filter === status ? 'var(--accent-primary)' : 'var(--fg-muted)',
              borderBottom: filter === status ? '2px solid var(--accent-primary)' : 'none',
              marginBottom: '-12px', transition: 'all var(--transition-fast)',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (filter !== status) e.currentTarget.style.color = 'var(--fg-default)';
            }}
            onMouseLeave={(e) => {
              if (filter !== status) e.currentTarget.style.color = 'var(--fg-muted)';
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({issues.filter(i => 
              (status === 'open' && i.status !== 'closed') ||
              (status === 'closed' && i.status === 'closed')
            ).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ 
              padding: '16px', background: 'var(--bg-canvas)',
              border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)',
              height: '60px', opacity: 0.5
            }} />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '60px 24px', textAlign: 'center',
          border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)',
        }}>
          <CircleDot size={48} style={{ color: 'var(--fg-subtle)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--fg-muted)', marginBottom: '8px' }}>
            No {filter} issues
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--fg-subtle)', marginBottom: '20px', maxWidth: '400px' }}>
            {filter === 'open' 
              ? 'All issues are resolved! Great work.' 
              : 'No closed issues yet.'}
          </p>
          {isAuthenticated && filter === 'open' && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 20px', background: 'var(--accent-emphasis)', color: '#fff',
                borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px',
                border: 'none', cursor: 'pointer', transition: 'opacity var(--transition-fast)',
                fontFamily: 'inherit'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Plus size={16} /> Create an Issue
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {issues.map((issue) => (
            <div key={issue._id} style={{
              padding: '16px', background: 'var(--bg-default)',
              border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast)', cursor: 'pointer'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-muted)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: getStatusColor(issue.status), marginTop: '2px' }}>
                  {getStatusIcon(issue.status)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--fg-default)', margin: '0 0 4px' }}>
                    {issue.title}
                  </h3>
                  {issue.description && (
                    <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '0 0 8px' }}>
                      {issue.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--fg-subtle)' }}>
                    {issue.priority && (
                      <span style={{ 
                        color: getPriorityColor(issue.priority),
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}>
                        {issue.priority} priority
                      </span>
                    )}
                    {issue.author && (
                      <span>
                        Opened by <strong>{issue.author.name || 'Unknown'}</strong>
                      </span>
                    )}
                    {issue.createdAt && (
                      <span>
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Issues;
