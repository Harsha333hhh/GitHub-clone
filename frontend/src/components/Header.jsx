import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Plus, Bell, ChevronDown, Search, Menu, X, GitPullRequest, FileText, Check, Trash2, Palette } from 'lucide-react';
import { useAuth } from '../store/authStore.js';
import axiosInstance from '../api/axiosConfig.js';
import { useThemeStore } from '../store/themeStore.js';

function Header() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { theme, font, setTheme, setFont } = useThemeStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const notifRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle "/" key to focus search bar
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    try {
      const res = await axiosInstance.get('/repository-api/repositories');
      const allRepos = res.data.payload || [];
      const filtered = allRepos.filter(repo =>
        repo.title.toLowerCase().includes(query.toLowerCase()) ||
        repo.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setSearchResults(filtered);
      setSearchOpen(true);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSearchSelect = (repoId) => {
    navigate(`/dashboard/repo/${repoId}`);
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  // Fetch unread count periodically
  React.useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchCount = async () => {
      try {
        const res = await axiosInstance.get('/notification-api/unread-count');
        setUnreadCount(res.data.payload || 0);
      } catch (err) {
        // Only log unexpected errors, ignore 401s (token expired)
        if (err.response?.status !== 401) {
          console.error('Failed to fetch unread count:', err.message);
        }
      }
    };
    
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notification-api/');
      setNotifications(res.data.payload || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch notifications:', err.message);
      }
    }
  };

  const handleBellClick = async () => {
    if (!notifOpen) await fetchNotifications();
    setNotifOpen(!notifOpen);
    setDropdownOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.put('/notification-api/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to mark notifications as read:', err.message);
      }
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axiosInstance.put(`/notification-api/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to mark notification as read:', err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setDropdownOpen(false);
      setCustomizationOpen(false);
      navigate('/');
    }
  };

  const notifIcon = (type) => {
    switch (type) {
      case 'pull_request': return <GitPullRequest size={14} style={{ color: 'var(--accent-primary)' }} />;
      case 'pr_approved': return <Check size={14} style={{ color: 'var(--success)' }} />;
      case 'pr_rejected': return <X size={14} style={{ color: 'var(--danger)' }} />;
      case 'file_created': return <FileText size={14} style={{ color: 'var(--success)' }} />;
      case 'file_updated': return <FileText size={14} style={{ color: 'var(--warning)' }} />;
      case 'file_deleted': return <Trash2 size={14} style={{ color: 'var(--danger)' }} />;
      default: return <Bell size={14} style={{ color: 'var(--fg-muted)' }} />;
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border-default)',
        padding: '0 max(12px, calc(100vw * 0.02))',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'max(8px, 3vw)', flex: 1 }}>
        <Link to="/dashboard" style={{ color: 'var(--fg-default)', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Github size={32} />
        </Link>

        {/* Search Bar - Hidden on mobile, visible on tablet+ */}
        <div ref={searchRef} style={{ position: 'relative', display: window.innerWidth < 768 ? 'none' : 'block', flex: 1 }} className="header-search">
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Type / to search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchResults.length > 0) {
                handleSearchSelect(searchResults[0]._id);
              }
            }}
            style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px 6px 32px',
              fontSize: '13px',
              color: 'var(--fg-default)',
              width: '100%',
              maxWidth: '360px',
              outline: 'none',
              transition: 'all var(--transition-normal)',
            }}
            onFocus={e => { e.target.style.width = '100%'; e.target.style.maxWidth = '420px'; e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
            onBlur={e => { e.target.style.width = '100%'; e.target.style.maxWidth = '360px'; e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
          />
          <kbd style={{
            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
            padding: '1px 6px', fontSize: '11px', color: 'var(--fg-subtle)',
            border: '1px solid var(--border-default)', borderRadius: '4px',
            background: 'var(--bg-subtle)', fontFamily: 'inherit'
          }}>/</kbd>

          {/* Search Results Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="animate-slide-down" style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: 'var(--bg-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
              maxHeight: '300px', overflowY: 'auto',
              zIndex: 100,
            }}>
              {searchResults.map(repo => (
                <button
                  key={repo._id}
                  onClick={() => handleSearchSelect(repo._id)}
                  style={{
                    width: '100%', padding: '12px 16px', textAlign: 'left',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: '1px solid var(--border-muted)',
                    transition: 'background var(--transition-fast)',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 600, color: 'var(--fg-default)', marginBottom: '4px' }}>{repo.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--fg-subtle)' }}>
                    {repo.description || 'No description'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav Links - Hidden on mobile, visible on desktop */}
        <nav style={{ display: window.innerWidth < 1024 ? 'none' : 'flex', gap: '4px' }} className="header-nav">
          {[
            { to: '/dashboard/pulls', label: 'Pull requests' },
            { to: '/dashboard/issues', label: 'Issues' },
            { to: '/dashboard/explore', label: 'Explore' },
            { to: '/dashboard/marketplace', label: 'Marketplace' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '14px',
              fontWeight: 500, color: 'var(--fg-muted)', transition: 'all var(--transition-fast)',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg-default)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >{label}</Link>
          ))}
        </nav>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard/new" style={{
              display: window.innerWidth < 640 ? 'none' : 'flex', alignItems: 'center', gap: '2px',
              padding: '4px 10px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)', color: 'var(--fg-muted)',
              fontSize: '13px', transition: 'all var(--transition-fast)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fg-subtle)'; e.currentTarget.style.color = 'var(--fg-default)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--fg-muted)'; }}
            >
              <Plus size={16} />
              <ChevronDown size={12} />
            </Link>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={handleBellClick} style={{
                display: 'flex', alignItems: 'center', position: 'relative',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              }}>
                <Bell size={18} style={{
                  color: notifOpen ? 'var(--fg-default)' : 'var(--fg-muted)',
                  transition: 'color var(--transition-fast)',
                }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-2px', right: '-4px',
                    minWidth: '16px', height: '16px', padding: '0 4px',
                    fontSize: '10px', fontWeight: 700, lineHeight: '16px',
                    textAlign: 'center', color: '#fff',
                    background: 'var(--accent-emphasis)',
                    borderRadius: '8px',
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="animate-slide-down" style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: '360px', maxHeight: '420px', overflowY: 'auto',
                  background: 'var(--bg-default)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderBottom: '1px solid var(--border-muted)',
                    position: 'sticky', top: 0, background: 'var(--bg-default)',
                    zIndex: 1,
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{
                        fontSize: '11px', fontWeight: 600, color: 'var(--accent-primary)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>Mark all as read</button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                      <Bell size={24} style={{ color: 'var(--fg-subtle)', marginBottom: '8px' }} />
                      <p style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} onClick={() => { if (!n.read) handleMarkRead(n._id); }}
                        style={{
                          display: 'flex', gap: '10px', padding: '10px 16px',
                          borderBottom: '1px solid var(--border-muted)',
                          background: n.read ? 'transparent' : 'rgba(88,166,255,0.04)',
                          cursor: n.read ? 'default' : 'pointer',
                          transition: 'background var(--transition-fast)',
                        }}
                        onMouseEnter={e => { if (!n.read) e.currentTarget.style.background = 'rgba(88,166,255,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(88,166,255,0.04)'; }}
                      >
                        <div style={{ marginTop: '2px', flexShrink: 0 }}>{notifIcon(n.type)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', color: 'var(--fg-default)', lineHeight: 1.4 }}>
                            <strong>{n.sender?.name}</strong>{' '}{n.message}
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--fg-subtle)', marginTop: '2px' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.read && (
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: 'var(--accent-primary)', flexShrink: 0,
                            marginTop: '4px',
                          }} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); setCustomizationOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                }}
              >
                <img
                  src={currentUser?.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                  alt="profile"
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    border: '2px solid var(--border-default)',
                    transition: 'border-color var(--transition-fast)',
                  }}
                />
                <ChevronDown size={12} style={{
                  color: 'var(--fg-muted)',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform var(--transition-fast)',
                }} />
              </button>

              {dropdownOpen && (
                <div className="animate-slide-down" style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: '280px', background: 'var(--bg-default)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-muted)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)' }}>
                      {currentUser?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                      {currentUser?.email}
                    </div>
                  </div>
                  <div style={{ padding: '4px 0' }}>
                    <Link to={`/dashboard/profile/${currentUser?.name}`} onClick={() => setDropdownOpen(false)}
                      style={dropdownItemStyle}>Your profile</Link>
                    <Link to="/dashboard/new" onClick={() => setDropdownOpen(false)}
                      style={dropdownItemStyle}>New repository</Link>
                    <Link to="/dashboard/pulls" onClick={() => setDropdownOpen(false)}
                      style={dropdownItemStyle}>Your pull requests</Link>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-muted)', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {themeOptions.filter(t => t.value === 'dark' || t.value === 'light').map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => { setTheme(option.value); setDropdownOpen(false); }}
                            style={{
                              ...themeButtonStyle,
                              width: '120px',
                              borderColor: theme === option.value ? option.accent : 'var(--border-default)',
                              background: theme === option.value ? option.soft : 'var(--bg-canvas)'
                            }}
                          >
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: option.dot, flexShrink: 0 }} />
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <Link to="/dashboard/customization" onClick={() => setDropdownOpen(false)} style={{
                        display: 'inline-block', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', color: 'var(--fg-default)', textDecoration: 'none', textAlign: 'center'
                      }}>More customization</Link>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-muted)', padding: '4px 0' }}>
                    <button onClick={handleLogout} style={{
                      ...dropdownItemStyle, width: '100%', textAlign: 'left',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--danger)', fontFamily: 'inherit',
                    }}>Sign out</button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/login" style={{
              fontSize: '14px', fontWeight: 500, color: 'var(--fg-muted)',
              transition: 'color var(--transition-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--fg-default)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-muted)'}
            >Sign in</Link>
            <Link to="/signup" style={{
              fontSize: '14px', fontWeight: 600, color: '#fff',
              background: 'var(--accent-emphasis)', padding: '6px 16px',
              borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)',
              border: '1px solid transparent',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-emphasis)'; }}
            >Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
}

const dropdownItemStyle = {
  display: 'block', padding: '8px 16px', fontSize: '13px',
  color: 'var(--fg-default)', transition: 'background var(--transition-fast)',
  textDecoration: 'none',
};

const themeOptions = [
  { label: 'Dark', value: 'dark', dot: '#58a6ff', accent: '#58a6ff', soft: 'rgba(88,166,255,0.12)' },
  { label: 'Light', value: 'light', dot: '#005cc5', accent: '#005cc5', soft: 'rgba(0,92,197,0.10)' },
  { label: 'Green', value: 'green', dot: '#146c43', accent: '#146c43', soft: 'rgba(20,108,67,0.12)' },
  { label: 'Orange', value: 'orange', dot: '#c2410c', accent: '#c2410c', soft: 'rgba(194,65,12,0.12)' },
  { label: 'Yellow', value: 'yellow', dot: '#b7791f', accent: '#b7791f', soft: 'rgba(183,121,31,0.12)' },
  { label: 'Blue', value: 'blue', dot: '#0b6bcb', accent: '#0b6bcb', soft: 'rgba(11,107,203,0.12)' },
];

const fontOptions = [
  { label: 'Inter', value: 'inter', css: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" },
  { label: 'Lucida Sans', value: 'lucida-sans', css: '"Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif' },
  { label: 'Lucida Bright', value: 'lucida-bright', css: '"Lucida Bright", Georgia, serif' },
  { label: 'Calligraphy', value: 'calligraphy', css: '"Apple Chancery", "Brush Script MT", "Segoe Script", cursive' },
];

const themeButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 10px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  fontFamily: 'inherit',
  transition: 'all var(--transition-fast)',
};

const fontButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all var(--transition-fast)',
};

const sectionLabelStyle = {
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--fg-default)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '8px',
};

export default Header;