import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { Plus } from 'lucide-react';

export default function Customization() {
  const { theme, setTheme, themes, font, setFont, fonts } = useThemeStore();

  const themeOptions = [
    { label: 'Dark', value: 'dark', dot: '#58a6ff' },
    { label: 'Light', value: 'light', dot: '#005cc5' },
    { label: 'Green', value: 'green', dot: '#146c43' },
    { label: 'Orange', value: 'orange', dot: '#c2410c' },
    { label: 'Yellow', value: 'yellow', dot: '#b7791f' },
    { label: 'Blue', value: 'blue', dot: '#0b6bcb' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '24px auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Customization</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--fg-subtle)' }}>Theme and font settings for your workspace</p>
        </div>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--fg-default)' }}>Back</Link>
      </div>

      <section style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Themes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
          {themeOptions.map(opt => (
            <button key={opt.value} onClick={() => setTheme(opt.value)}
              style={{ padding: '14px', borderRadius: '10px', border: `1px solid var(--border-default)`, background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: opt.dot }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 700 }}>{opt.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--fg-subtle)' }}>{theme === opt.value ? 'Selected' : ''}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Font style</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {fonts.map(f => (
            <button key={f.value} onClick={() => setFont(f.value)} style={{ padding: '12px', borderRadius: '10px', border: `1px solid var(--border-default)`, background: 'var(--bg-canvas)', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontWeight: 700 }}>{f.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--fg-subtle)', fontFamily: f.css }}>Aa Bb Cc</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
