import React from 'react';
import { Link } from 'react-router-dom';
import { CircleDot } from 'lucide-react';

function Issues() {
  return (
    <div className="animate-fade-in" style={{
      maxWidth: '960px', margin: '0 auto', padding: '48px 24px',
    }}>
      <div style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: '20px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--fg-default)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CircleDot size={24} style={{ color: 'var(--success)' }} />
          Issues
        </h1>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '60px 24px', textAlign: 'center',
        border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)',
      }}>
        <CircleDot size={48} style={{ color: 'var(--fg-subtle)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--fg-muted)', marginBottom: '8px' }}>
          No open issues
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--fg-subtle)', marginBottom: '20px', maxWidth: '400px' }}>
          Issues are used to track bugs, enhancements, and other tasks. Create one in a repository to get started.
        </p>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 20px', background: 'var(--accent-emphasis)', color: '#fff',
          borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px',
          textDecoration: 'none', transition: 'opacity var(--transition-fast)',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >Go to Repositories</Link>
      </div>
    </div>
  );
}

export default Issues;
