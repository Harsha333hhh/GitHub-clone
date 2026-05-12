import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { Book, Star, Circle, Plus, Search } from 'lucide-react';

function Home() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchPublicRepos = async () => {
      try {
        const res = await axiosInstance.get('/repository-api/repositories');
        setRepos(res.data.payload || res.data || []);
      } catch (err) {
        console.error("Error fetching feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicRepos();
  }, []);

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '1100px', margin: '0 auto', padding: '32px 24px',
      display: 'flex', gap: '32px', flexWrap: 'wrap',
    }}>
      {/* Left Sidebar */}
      <aside style={{ width: '260px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fg-default)' }}>Top Repositories</h2>
          <Link to="/new" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 12px', fontSize: '12px', fontWeight: 600,
            color: '#fff', background: 'var(--success)',
            borderRadius: 'var(--radius-md)', textDecoration: 'none',
            transition: 'opacity var(--transition-fast)',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={14} /> New
          </Link>
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
          <input
            type="text"
            placeholder="Find a repository..."
            style={{
              width: '100%', padding: '6px 12px 6px 30px', fontSize: '13px',
              background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
              outline: 'none', fontFamily: 'inherit',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
          />
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {user?.repositories?.length > 0 ? (
            user.repositories.slice(0, 7).map((repo) => (
              <li key={repo._id}>
                <Link to={`/repo/${repo._id}`} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 8px', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', color: 'var(--fg-default)', textDecoration: 'none',
                  transition: 'background var(--transition-fast)',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={user.profileImage} alt="owner" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                  <span style={{ fontWeight: 600 }}>{user.name}</span>
                  <span style={{ color: 'var(--fg-subtle)' }}>/</span>
                  <span style={{ color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {repo.title || repo.name}
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--fg-subtle)', padding: '4px 8px' }}>No repositories yet.</p>
          )}
        </ul>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--fg-default)', borderBottom: '1px solid var(--border-muted)', paddingBottom: '16px', marginBottom: '20px' }}>
          Explore Repositories
        </h1>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }}></div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {repos.map((repo) => (
              <div key={repo._id} style={{
                padding: '20px', background: 'var(--bg-default)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <img
                    src={repo.owner?.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                    alt="avatar" style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--fg-default)' }}>{repo.owner?.name}</span>
                    {' '}created a repository
                  </span>
                </div>

                <div style={{ marginLeft: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Book size={16} style={{ color: 'var(--fg-subtle)' }} />
                    <Link to={`/repo/${repo._id}`} style={{
                      fontSize: '16px', fontWeight: 700, color: 'var(--accent-primary)', textDecoration: 'none',
                    }}>{repo.title}</Link>
                  </div>
                  {repo.description && (
                    <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginBottom: '12px' }}>{repo.description}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--fg-subtle)' }}>
                    {repo.language && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Circle size={10} fill="currentColor" style={{ color: getLanguageColor(repo.language) }} />
                        {repo.language}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={13} /> 0
                    </span>
                    {repo.updatedAt && (
                      <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function getLanguageColor(lang) {
  const colors = {
    JavaScript: '#f1e05a', Python: '#3572A5', Java: '#b07219',
    'C++': '#f34b7d', TypeScript: '#3178c6', Go: '#00ADD8',
  };
  return colors[lang] || '#8b949e';
}

export default Home;