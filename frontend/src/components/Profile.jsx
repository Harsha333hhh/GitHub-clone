import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useParams, Link } from 'react-router-dom';
import { Book, Users, Star, MapPin, Calendar, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../store/authStore';

function Profile() {
  const { username } = useParams();
  const { currentUser, syncAuthState } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const isOwnProfile = currentUser?.name === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fixed: was calling port 5000 and wrong path
        const res = await axiosInstance.get(`/user-api/users/${username}`);
        setProfileData(res.data.payload || res.data);
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size must be less than 2MB');
      return;
    }

    setUploadingProfile(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result;
        
        try {
          const res = await axiosInstance.post('/user-api/upload-profile-picture', {
            profileImage: base64Image
          });

          const updatedUser = res.data.user;
          setProfileData(prev => ({...prev, profileImage: updatedUser.profileImage}));
          
          // Update localStorage with new user data
          localStorage.setItem('user', JSON.stringify(updatedUser));
          await syncAuthState();
        } catch (err) {
          setUploadError(err.response?.data?.message || 'Failed to upload profile picture');
        } finally {
          setUploadingProfile(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError('Error processing image');
      setUploadingProfile(false);
    }
    e.target.value = '';
  };

  const handleDeleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    setUploadingProfile(true);
    setUploadError('');

    try {
      const defaultImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
      const res = await axiosInstance.post('/user-api/upload-profile-picture', {
        profileImage: defaultImage
      });

      const updatedUser = res.data.user;
      setProfileData(prev => ({...prev, profileImage: updatedUser.profileImage}));
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      await syncAuthState();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to remove profile picture');
    } finally {
      setUploadingProfile(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px', display: 'flex', gap: '32px' }}>
      <div style={{ width: '260px', flexShrink: 0 }}>
        <div className="skeleton" style={{ width: '260px', height: '260px', borderRadius: '50%', marginBottom: '16px' }}></div>
        <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '8px' }}></div>
        <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '16px' }}></div>
        <div className="skeleton" style={{ height: '36px', width: '100%' }}></div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '30%' }}></div>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '80px', width: '100%' }}></div>)}
      </div>
    </div>
  );

  if (!profileData) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--fg-subtle)' }}>
      <p style={{ fontSize: '18px', marginBottom: '12px' }}>User not found.</p>
      <Link to="/" style={{ color: 'var(--accent-primary)', fontSize: '14px' }}>Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: window.innerWidth < 640 ? '16px 12px' : '32px 24px' }}>
      <div style={{ display: 'flex', gap: window.innerWidth < 640 ? '16px' : '32px', flexWrap: 'wrap' }}>

        {/* Left Sidebar */}
        <div style={{ width: window.innerWidth < 640 ? '100%' : '260px', flexShrink: 0 }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <img
              src={profileData.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
              alt={profileData.name}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: '50%',
                border: '3px solid var(--border-default)',
                boxShadow: 'var(--shadow-md)',
              }}
            />
            {isOwnProfile && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingProfile}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    border: '3px solid var(--bg-default)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: uploadingProfile ? 'not-allowed' : 'pointer',
                    opacity: uploadingProfile ? 0.7 : 1,
                    transition: 'all var(--transition-fast)',
                    fontFamily: 'inherit',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => { if (!uploadingProfile) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = uploadingProfile ? '0.7' : '1'; }}
                  title="Change profile picture"
                >
                  <Camera size={24} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={uploadingProfile}
                  style={{ display: 'none' }}
                />
              </>
            )}
          </div>

          {isOwnProfile && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingProfile}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: uploadingProfile ? 'not-allowed' : 'pointer',
                  opacity: uploadingProfile ? 0.7 : 1,
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onMouseEnter={e => { if (!uploadingProfile) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = uploadingProfile ? '0.7' : '1'; }}
              >
                <Camera size={16} /> Upload
              </button>
              <button
                onClick={handleDeleteProfilePicture}
                disabled={uploadingProfile}
                style={{
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'var(--bg-subtle)',
                  color: 'var(--fg-default)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  cursor: uploadingProfile ? 'not-allowed' : 'pointer',
                  opacity: uploadingProfile ? 0.7 : 1,
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onMouseEnter={e => { if (!uploadingProfile) e.currentTarget.style.borderColor = 'var(--danger)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                title="Delete profile picture"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {isOwnProfile && uploadError && (
            <div style={{ 
              padding: '10px 12px', 
              background: 'var(--danger)', 
              color: '#fff', 
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              {uploadError}
            </div>
          )}
          {isOwnProfile && uploadingProfile && (
            <div style={{ 
              padding: '10px 12px', 
              background: 'var(--accent-primary)', 
              color: '#fff', 
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              ⏳ Uploading...
            </div>
          )}

          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--fg-default)' }}>{profileData.name}</h1>
          <p style={{ fontSize: '18px', fontWeight: 300, color: 'var(--fg-muted)', marginBottom: '12px' }}>{username}</p>
          {profileData.bio && (
            <p style={{ fontSize: '14px', color: 'var(--fg-default)', marginBottom: '16px', lineHeight: 1.6 }}>{profileData.bio}</p>
          )}

          {!isOwnProfile && (
            <button style={{
              width: '100%', padding: '8px', fontSize: '13px', fontWeight: 600,
              background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
              cursor: 'pointer', transition: 'all var(--transition-fast)', fontFamily: 'inherit',
              marginBottom: '16px',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            >Follow</button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--fg-muted)' }}>
            <Users size={16} />
            <span style={{ fontWeight: 700, color: 'var(--fg-default)' }}>{profileData.followers?.length || 0}</span>
            <span>followers</span>
            <span style={{ margin: '0 4px', color: 'var(--fg-subtle)' }}>·</span>
            <span style={{ fontWeight: 700, color: 'var(--fg-default)' }}>{profileData.following?.length || 0}</span>
            <span>following</span>
          </div>

          {profileData.createdAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '13px', color: 'var(--fg-subtle)' }}>
              <Calendar size={14} />
              Joined {new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Right: Repositories */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ borderBottom: '1px solid var(--border-muted)', marginBottom: '20px' }}>
            <button style={{
              padding: '10px 16px', fontSize: '14px', fontWeight: 600,
              color: 'var(--fg-default)', background: 'none', border: 'none',
              borderBottom: '2px solid var(--accent-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
            }}>
              <Book size={16} /> Repositories
              <span style={{
                padding: '0 8px', fontSize: '12px',
                background: 'var(--bg-subtle)', borderRadius: '10px',
                color: 'var(--fg-muted)',
              }}>{profileData.repositories?.length || 0}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {profileData.repositories && profileData.repositories.length > 0 ? (
              profileData.repositories.map((repo) => (
                <div key={repo._id} style={{
                  padding: '20px 0', borderBottom: '1px solid var(--border-muted)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Link to={`/dashboard/repo/${repo._id}`} style={{
                        fontSize: '18px', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none',
                      }}>
                        {repo.title}
                      </Link>
                      {repo.visibility && (
                        <span style={{
                          marginLeft: '8px', padding: '2px 8px', fontSize: '11px',
                          border: '1px solid var(--border-default)', borderRadius: '12px',
                          color: 'var(--fg-muted)', textTransform: 'lowercase',
                        }}>{repo.visibility}</span>
                      )}
                      {repo.description && (
                        <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '6px', maxWidth: '500px' }}>
                          {repo.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--fg-subtle)' }}>
                        {repo.language && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: getLanguageColor(repo.language) }}></span>
                            {repo.language}
                          </span>
                        )}
                        {repo.updatedAt && <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', fontSize: '12px', fontWeight: 600,
                      background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)', color: 'var(--fg-muted)',
                      cursor: 'pointer', transition: 'all var(--transition-fast)', fontFamily: 'inherit',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                    >
                      <Star size={14} /> Star
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--fg-subtle)', padding: '40px 0', textAlign: 'center', fontSize: '14px' }}>
                This user doesn't have any repositories yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getLanguageColor(lang) {
  const colors = {
    JavaScript: '#f1e05a', Python: '#3572A5', Java: '#b07219',
    'C++': '#f34b7d', TypeScript: '#3178c6', Go: '#00ADD8',
    Rust: '#dea584', Ruby: '#701516',
  };
  return colors[lang] || '#8b949e';
}

export default Profile;