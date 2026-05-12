import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { Book, Users, Star } from 'lucide-react';

function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/user-api/users/${username}`);
        setProfile(response.data.payload || response.data);
      } catch (err) {
        console.error("User not found", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  const handleFollow = async () => {
    try {
      await axiosInstance.post(`/user-api/users/${profile._id}/follow`, {});
      alert("Following!");
    } catch (err) {
      alert("Action failed");
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--fg-subtle)' }}>
      <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px' }}></div>
      <div className="skeleton" style={{ height: '20px', width: '120px', margin: '0 auto' }}></div>
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--danger)' }}>User not found</div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div style={{ width: '260px', flexShrink: 0 }}>
          <img
            src={profile.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
            alt={profile.name}
            style={{
              width: '100%', borderRadius: '50%',
              border: '3px solid var(--border-default)', boxShadow: 'var(--shadow-md)',
            }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--fg-default)', marginTop: '16px' }}>{profile.name}</h1>
          <p style={{ fontSize: '18px', fontWeight: 300, color: 'var(--fg-muted)' }}>{username}</p>
          {profile.bio && <p style={{ marginTop: '12px', color: 'var(--fg-default)', fontSize: '14px' }}>{profile.bio}</p>}
          <button onClick={handleFollow} style={{
            width: '100%', marginTop: '16px', padding: '8px', fontSize: '13px', fontWeight: 600,
            background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', color: 'var(--fg-default)', cursor: 'pointer',
            transition: 'all var(--transition-fast)', fontFamily: 'inherit',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg-subtle)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
          >Follow</button>
        </div>

        {/* Repos */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ borderBottom: '1px solid var(--border-muted)', marginBottom: '20px', paddingBottom: '8px' }}>
            <h2 style={{
              fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Book size={16} /> Repositories
              <span style={{
                padding: '0 8px', fontSize: '12px', background: 'var(--bg-subtle)',
                borderRadius: '10px', color: 'var(--fg-muted)',
              }}>{profile.repositories?.length || 0}</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {profile.repositories?.map((repo) => (
              <div key={repo._id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-muted)' }}>
                <Link to={`/repo/${repo._id}`} style={{
                  fontSize: '18px', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none',
                }}>{repo.title}</Link>
                {repo.description && (
                  <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px' }}>{repo.description}</p>
                )}
              </div>
            ))}
            {(!profile.repositories || profile.repositories.length === 0) && (
              <p style={{ color: 'var(--fg-subtle)', padding: '40px 0', textAlign: 'center' }}>
                No repositories yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;