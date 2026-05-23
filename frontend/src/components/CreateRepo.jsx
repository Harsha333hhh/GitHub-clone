import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { Info, Lock, Globe, GitBranch } from 'lucide-react';

function CreateRepo() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'JavaScript',
    visibility: 'public',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { syncAuthState } = useAuth();

  useEffect(() => {
    // Sync auth state on component mount
    syncAuthState();
  }, [syncAuthState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Repository name is required");
      return;
    }
    setLoading(true);

    try {
      const response = await axiosInstance.post('/repository-api/repositories', formData);
      // Backend returns { payload: { _id: ... } }
      const repoId = response.data.payload?._id || response.data._id;
      if (repoId) {
        navigate(`/dashboard/repo/${repoId}`);
      }
    } catch (err) {
      console.error("Create repo error:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        navigate('/login');
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.reason || err.message || "Failed to create repository";
        alert("Error: " + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <div className="animate-fade-in" style={{
      maxWidth: '680px', margin: '0 auto', padding: '48px 24px',
    }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: '20px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--fg-default)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GitBranch size={24} style={{ color: 'var(--accent-primary)' }} />
          Create a new repository
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--fg-muted)', marginTop: '6px' }}>
          A repository contains all project files, revision history, and collaborator discussion.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Name & Language row */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={labelStyle}>Repository name *</label>
            <input
              type="text" name="title"
              placeholder="e.g. my-awesome-project"
              value={formData.title}
              onChange={handleChange}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
              required
            />
          </div>
          <div style={{ width: '180px', flexShrink: 0 }}>
            <label style={labelStyle}>Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
            >
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description <span style={{ color: 'var(--fg-subtle)', fontWeight: 400 }}>(optional)</span></label>
          <textarea
            name="description" rows="3"
            placeholder="Short description of your repository..."
            value={formData.description}
            onChange={handleChange}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Visibility */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { value: 'public', icon: <Globe size={18} />, label: 'Public', desc: 'Anyone can see this repository.' },
            { value: 'private', icon: <Lock size={18} />, label: 'Private', desc: 'Only you can see this repository.' },
          ].map(({ value, icon, label, desc }) => (
            <label key={value} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '14px 16px', borderRadius: 'var(--radius-md)',
              border: `1px solid ${formData.visibility === value ? 'var(--accent-primary)' : 'var(--border-default)'}`,
              background: formData.visibility === value ? 'rgba(88,166,255,0.06)' : 'transparent',
              cursor: 'pointer', transition: 'all var(--transition-fast)',
            }}>
              <input
                type="radio" name="visibility" value={value}
                checked={formData.visibility === value}
                onChange={handleChange}
                style={{ marginTop: '3px', accentColor: 'var(--accent-primary)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ color: formData.visibility === value ? 'var(--accent-primary)' : 'var(--fg-subtle)' }}>
                  {icon}
                </span>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: 'var(--fg-default)' }}>{label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>{desc}</span>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Info Box */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 16px', fontSize: '13px',
          background: 'rgba(88,166,255,0.06)',
          border: '1px solid rgba(88,166,255,0.2)',
          borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)',
        }}>
          <Info size={18} style={{ flexShrink: 0 }} />
          <p>This will initialize your repository on the local server.</p>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} style={{
          padding: '10px 24px', fontSize: '14px', fontWeight: 600,
          color: '#fff', background: loading ? 'var(--fg-subtle)' : 'var(--success)',
          border: 'none', borderRadius: 'var(--radius-md)',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-fast)', fontFamily: 'inherit',
          alignSelf: 'flex-start',
        }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {loading ? 'Creating...' : 'Create repository'}
        </button>
      </form>
    </div>
  );
}

export default CreateRepo;