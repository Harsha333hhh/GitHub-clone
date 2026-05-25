import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useAuth } from '../store/authStore';
import axiosInstance from '../api/axiosConfig';
import { Plus, Camera, Upload } from 'lucide-react';

export default function Customization() {
  const { theme, setTheme, themes, font, setFont, fonts } = useThemeStore();
  const { currentUser, syncAuthState } = useAuth();
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

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

    setUploading(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result;
        
        const res = await axiosInstance.post('/user-api/upload-profile-picture', {
          profileImage: base64Image
        });

        const updatedUser = res.data.user;
        setProfileImage(updatedUser.profileImage);
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        await syncAuthState();
        alert('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

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
          <p style={{ margin: '6px 0 0', color: 'var(--fg-subtle)' }}>Theme, font, and profile settings</p>
        </div>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--fg-default)' }}>Back</Link>
      </div>

      {/* Profile Picture Section */}
      <section style={{ marginBottom: '24px', padding: '20px', background: 'var(--bg-canvas)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Profile Picture</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
              alt="Profile"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '2px solid var(--border-default)',
                objectFit: 'cover'
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                border: '2px solid var(--bg-canvas)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.7 : 1,
                transition: 'all var(--transition-fast)',
                fontFamily: 'inherit'
              }}
              onMouseEnter={e => { if (!uploading) e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = uploading ? '0.7' : '1'; }}
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: 'var(--fg-default)' }}>
              Upload Profile Picture
            </p>
            <p style={{ margin: '0', fontSize: '12px', color: 'var(--fg-muted)' }}>
              Maximum file size: 2MB. Supported formats: JPG, PNG, GIF, WebP
            </p>
            {uploadError && (
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--danger)' }}>
                ⚠ {uploadError}
              </p>
            )}
            {uploading && (
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--accent-primary)' }}>
                ⏳ Uploading...
              </p>
            )}
          </div>
        </div>
      </section>

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
