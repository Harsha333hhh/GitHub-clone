import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Heart } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  const linkStyle = {
    fontSize: '12px', color: 'var(--accent-primary)',
    transition: 'color var(--transition-fast)', textDecoration: 'none',
  };

  const links = [
    { to: '#', label: 'Terms' },
    { to: '#', label: 'Privacy' },
    { to: '#', label: 'Security' },
    { to: '#', label: 'Status' },
    { to: '#', label: 'Docs' },
    { to: '#', label: 'Contact' },
    { to: '#', label: 'Pricing' },
    { to: '#', label: 'API' },
    { to: '#', label: 'Blog' },
    { to: '#', label: 'About' },
  ];

  return (
    <footer style={{
      maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 32px',
      borderTop: '1px solid var(--border-muted)',
    }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: '16px',
      }}>
        {/* Logo + Copyright */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Github size={20} style={{ color: 'var(--fg-subtle)' }} />
          <span style={{ fontSize: '12px', color: 'var(--fg-subtle)' }}>
            © {currentYear} GitHub Clone
          </span>
          <span style={{ fontSize: '12px', color: 'var(--fg-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            · Made with <Heart size={10} style={{ color: 'var(--danger)' }} /> by AU 2027
          </span>
        </div>

        {/* Links */}
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          {links.map(({ to, label }) => (
            <Link key={label} to={to} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-primary)'}
            >{label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default Footer;