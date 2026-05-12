import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Zap, Shield, Code2, BarChart3, Globe } from 'lucide-react';

function Marketplace() {
  const categories = [
    { icon: <Zap size={24} />, title: 'CI / CD', desc: 'Automate your workflow from idea to production', color: '#f0883e' },
    { icon: <Shield size={24} />, title: 'Security', desc: 'Find and fix vulnerabilities in your code', color: '#58a6ff' },
    { icon: <Code2 size={24} />, title: 'Code Quality', desc: 'Improve your code with automated reviews', color: '#3fb950' },
    { icon: <BarChart3 size={24} />, title: 'Monitoring', desc: 'Track performance and catch issues early', color: '#bc8cff' },
    { icon: <Globe size={24} />, title: 'Deployment', desc: 'Deploy your projects with ease', color: '#f778ba' },
    { icon: <ShoppingBag size={24} />, title: 'Project Mgmt', desc: 'Plan, track, and manage your projects', color: '#79c0ff' },
  ];

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '960px', margin: '0 auto', padding: '48px 24px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
          <span className="text-gradient">Marketplace</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--fg-muted)', maxWidth: '500px', margin: '0 auto' }}>
          Extend GitHub Clone with tools and integrations to streamline your workflow.
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        gap: '16px',
      }}>
        {categories.map(({ icon, title, desc, color }) => (
          <div key={title} style={{
            padding: '24px', background: 'var(--bg-default)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
            transition: 'all var(--transition-fast)', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 20px ${color}15`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ color, marginBottom: '12px' }}>{icon}</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--fg-default)', marginBottom: '6px' }}>{title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--fg-muted)', lineHeight: 1.5 }}>{desc}</p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '40px', padding: '24px', textAlign: 'center',
        background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-muted)',
      }}>
        <p style={{ fontSize: '14px', color: 'var(--fg-muted)' }}>
          More integrations coming soon. <span style={{ color: 'var(--accent-primary)' }}>Stay tuned!</span>
        </p>
      </div>
    </div>
  );
}

export default Marketplace;
