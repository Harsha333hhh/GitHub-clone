import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Book, Plus, History, Star, GitBranch, Search, Bell, Bookmark, ArrowRight } from 'lucide-react';

function Dashboard() {
  const [myRepos, setMyRepos] = useState([]);
  const [allRepos, setAllRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser, syncAuthState } = useAuth();

  useEffect(() => {
    // Sync auth state to ensure we have the latest user data
    syncAuthState();
  }, [syncAuthState]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch ALL repos for the main discovery feed
        const allReposRes = await axiosInstance.get('/repository-api/repositories');
        setAllRepos(allReposRes.data.payload || []);

        // Fetch only the current user's repos for the sidebar
        if (currentUser?._id) {
          const myReposRes = await axiosInstance.get(`/repository-api/repositories/user/${currentUser._id}`);
          setMyRepos(myReposRes.data.payload || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?._id]);

  const SkeletonCard = () => (
    <div style={{
      padding: '20px', background: 'var(--bg-default)',
      border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
    }}>
      <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '12px' }}></div>
      <div className="skeleton" style={{ height: '12px', width: '90%', marginBottom: '8px' }}></div>
      <div className="skeleton" style={{ height: '12px', width: '40%' }}></div>
    </div>
  );

  if (loading) return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 24px 40px' }}>
      <div className="skeleton" style={{ height: '64px', width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}></div>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="skeleton" style={{ height: '22px', width: '60%', marginBottom: '14px' }}></div>
          <div className="skeleton" style={{ height: '36px', width: '100%', marginBottom: '12px' }}></div>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '24px', width: '100%', marginBottom: '8px' }}></div>)}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '1400px', margin: '0 auto', padding: '28px 24px 40px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', padding: window.innerWidth < 640 ? '12px 16px' : '18px 20px', marginBottom: '24px',
        background: 'var(--bg-default)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        flexWrap: window.innerWidth < 640 ? 'wrap' : 'nowrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)'
            }} />
            <span style={{ fontSize: window.innerWidth < 640 ? '10px' : '12px', color: 'var(--fg-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dashboard</span>
          </div>
          <h1 style={{ fontSize: window.innerWidth < 640 ? '18px' : '24px', fontWeight: 700, color: 'var(--fg-default)', margin: 0 }}>
            Welcome back, {currentUser?.name || 'developer'}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth < 640 ? '8px' : '10px', flexWrap: 'wrap', justifyContent: window.innerWidth < 640 ? 'flex-start' : 'flex-end' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: window.innerWidth < 640 ? '8px 10px' : '10px 14px',
            minWidth: window.innerWidth < 640 ? 'auto' : '260px', background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', color: 'var(--fg-subtle)',
          }}>
            <Search size={window.innerWidth < 640 ? 12 : 14} />
            <span style={{ fontSize: window.innerWidth < 640 ? '12px' : '13px', display: window.innerWidth < 640 ? 'none' : 'inline' }}>Type / to search repositories</span>
          </div>
          <Link to="/dashboard/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: window.innerWidth < 640 ? '8px 10px' : '10px 14px', background: 'var(--success)', color: '#fff',
            borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: window.innerWidth < 640 ? '12px' : '13px',
            textDecoration: 'none', transition: 'opacity var(--transition-fast)',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={16} /> {window.innerWidth < 640 ? '' : 'New'}
          </Link>
        </div>
      </div>

      <div style={{
        display: 'grid', 
        gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '280px minmax(0, 1fr)', 
        gap: window.innerWidth < 640 ? '16px' : '24px', 
        alignItems: 'start'
      }}>
        <aside style={{ position: window.innerWidth < 640 ? 'relative' : 'sticky', top: '88px' }}>
          {/* Profile Picture Card - Read Only */}
          <div style={{
            padding: '18px', marginBottom: '16px', background: 'var(--bg-default)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
            textAlign: 'center'
          }}>
            <img
              src={currentUser?.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
              alt={currentUser?.name}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '2px solid var(--border-default)',
                objectFit: 'cover',
                margin: '0 auto 12px',
                display: 'block'
              }}
            />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-default)', margin: '0 0 4px' }}>
              {currentUser?.name}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--fg-subtle)', margin: 0 }}>
              @{currentUser?.name?.toLowerCase().replace(/\s+/g, '_')}
            </p>
          </div>

          <div style={{
            padding: '18px', marginBottom: '16px', background: 'var(--bg-default)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-default)', margin: 0 }}>Top repositories</h2>
              <span style={{ fontSize: '12px', color: 'var(--fg-subtle)' }}>{myRepos.length}</span>
            </div>
            <input
              type="text"
              placeholder="Find a repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', fontSize: '13px',
                background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
                outline: 'none', marginBottom: '14px', fontFamily: 'inherit',
              }}
            />

            {(() => {
              const filtered = myRepos.filter(repo =>
                repo.title?.toLowerCase().includes(searchQuery.toLowerCase())
              );

              return (
                <>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0, padding: 0 }}>
                    {filtered.slice(0, 7).map(repo => (
                      <li key={repo._id}>
                        <Link to={`/dashboard/repo/${repo._id}`} style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 10px', borderRadius: 'var(--radius-md)',
                          fontSize: '13px', color: 'var(--fg-default)',
                          transition: 'background var(--transition-fast)', textDecoration: 'none',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Bookmark size={14} style={{ color: 'var(--fg-subtle)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {repo.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {searchQuery && filtered.length === 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--fg-subtle)', padding: '8px 0 0', fontStyle: 'italic' }}>
                      No repositories matching "{searchQuery}"
                    </p>
                  )}
                  {!searchQuery && myRepos.length === 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--fg-subtle)', padding: '8px 0 0', fontStyle: 'italic' }}>
                      You don't have any repositories yet.
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          <div style={{
            padding: '18px', marginBottom: '16px', background: 'var(--bg-default)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)'
          }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-default)', margin: '0 0 12px' }}>Quick actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/dashboard/new" style={sidebarActionStyle}><Plus size={14} /> Create repository</Link>
              <Link to="/dashboard/explore" style={sidebarActionStyle}><GitBranch size={14} /> Explore</Link>
              <Link to="/dashboard/issues" style={sidebarActionStyle}><History size={14} /> Recent activity</Link>
            </div>
          </div>

          <div style={{
            padding: '18px', background: 'var(--bg-default)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)'
          }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-default)', margin: '0 0 12px' }}>Recent activity</h2>
            <p style={{ fontSize: '12px', color: 'var(--fg-subtle)', fontStyle: 'italic', margin: 0 }}>
              No recent activity found.
            </p>
          </div>
        </aside>

        <main style={{ minWidth: 0 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '20px'
          }}>
            {[
              { label: 'Repositories', value: allRepos.length },
              { label: 'Your repos', value: myRepos.length },
              { label: 'Stars', value: '0' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '16px', background: 'var(--bg-default)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--fg-subtle)', marginBottom: '6px' }}>{item.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--fg-default)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '18px', background: 'var(--bg-default)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg-default)', margin: 0 }}>
                  {myRepos.length > 0 ? 'Your feed' : 'Explore repositories'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--fg-subtle)', margin: '4px 0 0' }}>
                  Discover updates from your repositories and the wider community.
                </p>
              </div>
              <Link to="/dashboard/explore" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none'
              }}>
                See more <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allRepos.length > 0 ? (
                allRepos.map((repo) => (
                  <div key={repo._id} style={{
                    padding: '18px', background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
                    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; e.currentTarget.style.borderColor = 'var(--accent-emphasis)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <GitBranch size={16} style={{ color: 'var(--fg-subtle)' }} />
                          <Link to={`/dashboard/repo/${repo._id}`} style={{
                            fontSize: '16px', fontWeight: 700, color: 'var(--fg-default)',
                            textDecoration: 'none', wordBreak: 'break-word',
                          }}>
                            {repo.owner?.name && <span style={{ color: 'var(--fg-muted)', fontWeight: 500 }}>{repo.owner.name} / </span>}
                            {repo.title}
                          </Link>
                          <span style={{
                            padding: '2px 8px', fontSize: '11px', fontWeight: 600,
                            border: '1px solid var(--border-default)', borderRadius: '999px',
                            color: 'var(--fg-muted)', textTransform: 'capitalize',
                          }}>{repo.visibility}</span>
                        </div>
                        {repo.description && (
                          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '0 0 12px', maxWidth: '760px', lineHeight: 1.55 }}>
                            {repo.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--fg-subtle)', flexWrap: 'wrap' }}>
                          {repo.language && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: getLanguageColor(repo.language), display: 'inline-block',
                              }} />
                              {repo.language}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={13} /> 0
                          </span>
                          {repo.updatedAt && (
                            <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Link to={`/dashboard/repo/${repo._id}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 12px', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)', color: 'var(--fg-default)',
                        textDecoration: 'none', fontSize: '13px', fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        Open <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '60px 24px', textAlign: 'center',
                  border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-canvas)'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--fg-default)', marginBottom: '8px' }}>
                    Welcome to your dashboard!
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--fg-subtle)', marginBottom: '16px' }}>
                    Create your first repository or explore existing ones.
                  </p>
                  <Link to="/dashboard/new" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 20px', background: 'var(--success)', color: '#fff',
                    borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px',
                    textDecoration: 'none', transition: 'opacity var(--transition-fast)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Plus size={16} /> New Repository
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const sidebarActionStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 10px',
  borderRadius: 'var(--radius-md)',
  textDecoration: 'none',
  color: 'var(--fg-default)',
  background: 'var(--bg-canvas)',
  border: '1px solid var(--border-default)',
  fontSize: '13px',
  fontWeight: 500,
};

function getLanguageColor(lang) {
  const colors = {
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    TypeScript: '#3178c6',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
  };
  return colors[lang] || '#8b949e';
}

export default Dashboard;