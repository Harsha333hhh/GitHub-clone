import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../store/authStore.js';
import { Folder, FileText, GitBranch, Clock, Star, Eye, Plus, X, Save, FileCode, Trash2, GitPullRequest, Download, Users } from 'lucide-react';
import Collaborate from './Collaborate';
import PRList from './PRList';

function RepoExplorer() {
  const { repoId } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const [repoInfo, setRepoInfo] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('files'); // 'files' or 'collaborate'

  // Add file state
  const [showEditor, setShowEditor] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = React.useRef(null);
  const folderInputRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');

  // Permissions
  const isOwner = isAuthenticated && repoInfo?.owner && currentUser?._id === repoInfo.owner._id;
  const isCollaborator = isAuthenticated && repoInfo?.collaborators?.some(c => c._id === currentUser?._id || c === currentUser?._id);
  const canWrite = isOwner || isCollaborator;

  const fetchFiles = async () => {
    try {
      const fileRes = await axiosInstance.get(`/file-api/${repoId}/files`);
      setFiles(fileRes.data.payload || fileRes.data || []);
    } catch {
      setFiles([]);
    }
  };

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const repoRes = await axiosInstance.get(`/repository-api/repo/${repoId}`);
        setRepoInfo(repoRes.data.payload || repoRes.data);
        await fetchFiles();
      } catch (err) {
        console.error("Error loading repository", err);
        setError("Failed to load repository. Please check if the repository ID exists.");
      } finally {
        setLoading(false);
      }
    };
    fetchRepoData();
  }, [repoId, fetchFiles]);

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      setSaveError('File name is required');
      return;
    }
    setSaving(true);
    setSaveError('');

    try {
      await axiosInstance.post(`/file-api/${repoId}/files`, {
        fileName: newFileName.trim(),
        path: `/${newFileName.trim()}`,
        content: newFileContent,
        size: `${new Blob([newFileContent]).size}`,
      });
      await fetchFiles();
      setShowEditor(false);
      setNewFileName('');
      setNewFileContent('');
    } catch (err) {
      console.error("Error creating file:", err);
      setSaveError(err.response?.data?.reason || err.response?.data?.message || 'Failed to create file');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await axiosInstance.delete(`/file-api/files/${fileId}`);
      await fetchFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
      alert(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const handleRequestAccess = async () => {
    setRequestingAccess(true);
    setAccessMessage('');
    try {
      await axiosInstance.post('/pullrequest-api/', {
        repository: repoId,
        message: `Requesting access to collaborate on ${repoInfo?.title || 'this repository'}`
      });
      setAccessMessage('Access request sent! The owner will be notified.');
    } catch (err) {
      setAccessMessage(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestingAccess(false);
    }
  };

  const handleDownloadZip = () => {
    // Create a simple zip-like download with all file contents
    if (files.length === 0) {
      alert('No files to download');
      return;
    }
    const content = files.map(f =>
      `// ===== ${f.fileName || f.name} =====\n${f.content || '(empty)'}\n`
    ).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repoInfo?.title || 'repo'}-files.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
    fontSize: '14px', outline: 'none', transition: 'all var(--transition-fast)',
    fontFamily: 'inherit',
  };

  if (loading) return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      <div className="skeleton" style={{ height: '28px', width: '40%', marginBottom: '24px' }}></div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
            <div className="skeleton" style={{ width: '18px', height: '18px', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '14px', width: `${40 + i * 10}%` }}></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--danger)' }}>
      <p style={{ fontSize: '16px' }}>{error}</p>
      <Link to="/" style={{
        display: 'inline-block', marginTop: '16px', padding: '8px 20px',
        background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)', color: 'var(--fg-default)', fontSize: '14px',
        textDecoration: 'none',
      }}>Go to Dashboard</Link>
    </div>
  );

  if (!repoInfo) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--fg-subtle)' }}>
      No repository data found.
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Repo Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <GitBranch size={20} style={{ color: 'var(--fg-subtle)' }} />
        {repoInfo?.owner && (
          <>
            <Link to={`/profile/${repoInfo.owner.name}`} style={{
              fontSize: '18px', color: 'var(--accent-primary)', fontWeight: 500, textDecoration: 'none',
            }}>{repoInfo.owner.name}</Link>
            <span style={{ color: 'var(--fg-subtle)', fontSize: '18px' }}>/</span>
          </>
        )}
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fg-default)' }}>{repoInfo?.title}</span>
        <span style={{
          marginLeft: '4px', padding: '2px 10px', fontSize: '11px', fontWeight: 500,
          border: '1px solid var(--border-default)', borderRadius: '12px',
          color: 'var(--fg-muted)', textTransform: 'lowercase',
        }}>{repoInfo?.visibility}</span>
        {isCollaborator && !isOwner && (
          <span style={{
            marginLeft: '4px', padding: '2px 10px', fontSize: '11px', fontWeight: 600,
            background: 'var(--purple-subtle)', border: '1px solid rgba(188,140,255,0.3)',
            borderRadius: '12px', color: 'var(--purple)',
          }}>Collaborator</span>
        )}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { icon: <Eye size={14} />, label: 'Watch', count: '0' },
          { icon: <Star size={14} />, label: 'Star', count: '0' },
          { icon: <GitBranch size={14} />, label: 'Fork', count: '0' },
        ].map(({ icon, label, count }) => (
          <button key={label} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', fontSize: '12px', fontWeight: 600,
            background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', color: 'var(--fg-muted)',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
            fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fg-subtle)'; e.currentTarget.style.color = 'var(--fg-default)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--fg-muted)'; }}
          >
            {icon} {label} <span style={{ padding: '0 6px', background: 'var(--bg-canvas)', borderRadius: '8px', fontSize: '11px' }}>{count}</span>
          </button>
        ))}

        {/* Download button — always visible */}
        <button onClick={handleDownloadZip} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', fontSize: '12px', fontWeight: 600,
          background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', color: 'var(--fg-muted)',
          cursor: 'pointer', transition: 'all var(--transition-fast)',
          fontFamily: 'inherit',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fg-subtle)'; e.currentTarget.style.color = 'var(--fg-default)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--fg-muted)'; }}
        >
          <Download size={14} /> Download
        </button>

        {/* Upload file/folder buttons */}
        {canWrite && (
          <>
            {/* File input for files */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={async (e) => {
                const chosen = Array.from(e.target.files || []);
                if (chosen.length === 0) return;
                setUploading(true);
                try {
                  for (const f of chosen) {
                    const text = await f.text();
                    const fileName = f.name;
                    await axiosInstance.post(`/file-api/${repoId}/files`, {
                      fileName,
                      path: `/${fileName}`,
                      content: text,
                      size: `${f.size}`,
                    });
                  }
                  await fetchFiles();
                  alert('Files uploaded successfully');
                } catch (err) {
                  console.error('Upload error', err);
                  alert(err.response?.data?.message || 'Failed to upload files');
                } finally {
                  e.target.value = null;
                  setUploading(false);
                }
              }}
            />
            
            {/* Folder input for directory upload */}
            <input
              ref={folderInputRef}
              type="file"
              multiple
              webkitdirectory="true"
              mozdirectory="true"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const chosen = Array.from(e.target.files || []);
                if (chosen.length === 0) return;
                setUploading(true);
                try {
                  for (const f of chosen) {
                    const text = await f.text();
                    const filePath = f.webkitRelativePath || f.name;
                    await axiosInstance.post(`/file-api/${repoId}/files`, {
                      fileName: filePath.split('/').pop(),
                      path: `/${filePath}`,
                      content: text,
                      size: `${f.size}`,
                    });
                  }
                  await fetchFiles();
                  alert('Folder uploaded successfully');
                } catch (err) {
                  console.error('Upload error', err);
                  alert(err.response?.data?.message || 'Failed to upload folder');
                } finally {
                  e.target.value = null;
                  setUploading(false);
                }
              }}
            />
            
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 14px', fontSize: '12px', fontWeight: 600,
              background: uploading ? 'var(--fg-subtle)' : 'var(--bg-subtle)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--fg-muted)',
              cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all var(--transition-fast)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.color = 'var(--fg-default)'; }}
            onMouseLeave={e => { if (!uploading) e.currentTarget.style.color = 'var(--fg-muted)'; }}
            >
              <Plus size={14} /> {uploading ? 'Uploading...' : 'Upload file'}
            </button>
            
            <button onClick={() => folderInputRef.current?.click()} disabled={uploading} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 14px', fontSize: '12px', fontWeight: 600,
              background: uploading ? 'var(--fg-subtle)' : 'var(--bg-subtle)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--fg-muted)',
              cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all var(--transition-fast)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.color = 'var(--fg-default)'; }}
            onMouseLeave={e => { if (!uploading) e.currentTarget.style.color = 'var(--fg-muted)'; }}
            >
              <Plus size={14} /> {uploading ? 'Uploading...' : 'Upload folder'}
            </button>
          </>
        )}

        <div style={{ flex: 1 }} />

        {/* Request Access — only for authenticated non-owner, non-collaborator */}
        {isAuthenticated && !canWrite && (
          <button onClick={handleRequestAccess} disabled={requestingAccess} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px', fontSize: '12px', fontWeight: 600,
            background: 'var(--accent-emphasis)', border: '1px solid transparent',
            borderRadius: 'var(--radius-md)', color: '#fff',
            cursor: requestingAccess ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)', fontFamily: 'inherit',
            opacity: requestingAccess ? 0.7 : 1,
          }}
            onMouseEnter={e => { if (!requestingAccess) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = requestingAccess ? '0.7' : '1'; }}
          >
            <GitPullRequest size={14} />
            {requestingAccess ? 'Sending...' : 'Request Access'}
          </button>
        )}

        {/* Add File Button — only for owner/collaborator */}
        {canWrite && (
          <button onClick={() => { setShowEditor(true); setSaveError(''); }} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px', fontSize: '12px', fontWeight: 600,
            background: 'var(--success)', border: '1px solid transparent',
            borderRadius: 'var(--radius-md)', color: '#fff',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
            fontFamily: 'inherit',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={14} /> Add file
          </button>
        )}
      </div>

      {/* Access message */}
      {accessMessage && (
        <div className="animate-slide-down" style={{
          padding: '10px 16px', marginBottom: '16px', fontSize: '13px',
          borderRadius: 'var(--radius-md)',
          background: accessMessage.includes('sent') ? 'var(--success-subtle)' : 'var(--warning-subtle)',
          color: accessMessage.includes('sent') ? 'var(--success)' : 'var(--warning)',
          border: `1px solid ${accessMessage.includes('sent') ? 'rgba(63,185,80,0.3)' : 'rgba(210,153,34,0.3)'}`,
        }}>
          {accessMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '20px',
        borderBottom: '2px solid var(--border-default)',
        position: 'relative'
      }}>
        <button
          onClick={() => setActiveTab('files')}
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'files' ? '600' : '500',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'files' ? 'var(--accent-primary)' : 'var(--fg-muted)',
            borderBottom: activeTab === 'files' ? '3px solid var(--accent-primary)' : 'none',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'files') {
              e.currentTarget.style.color = 'var(--fg-default)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'files') {
              e.currentTarget.style.color = 'var(--fg-muted)';
            }
          }}
        >
          <FileText size={16} />
          Files
        </button>

        {/* Collaborate tab - visible to owner only */}
        {isOwner && (
          <button
            onClick={() => setActiveTab('collaborate')}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: activeTab === 'collaborate' ? '600' : '500',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'collaborate' ? 'var(--accent-primary)' : 'var(--fg-muted)',
              borderBottom: activeTab === 'collaborate' ? '3px solid var(--accent-primary)' : 'none',
              marginBottom: '-2px',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'collaborate') {
                e.currentTarget.style.color = 'var(--fg-default)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'collaborate') {
                e.currentTarget.style.color = 'var(--fg-muted)';
              }
            }}
          >
            <Users size={16} />
            Collaborate
          </button>
        )}

        {/* Pull Requests tab */}
        <button
          onClick={() => setActiveTab('pullrequests')}
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'pullrequests' ? '600' : '500',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'pullrequests' ? 'var(--accent-primary)' : 'var(--fg-muted)',
            borderBottom: activeTab === 'pullrequests' ? '3px solid var(--accent-primary)' : 'none',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'pullrequests') {
              e.currentTarget.style.color = 'var(--fg-default)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'pullrequests') {
              e.currentTarget.style.color = 'var(--fg-muted)';
            }
          }}
        >
          <GitPullRequest size={16} />
          Pull Requests
        </button>
      </div>

      {/* Files Tab Content */}
      {activeTab === 'files' && (
        <>
          {/* Description */}
          {repoInfo?.description && (
            <p style={{ fontSize: '14px', color: 'var(--fg-muted)', marginBottom: '20px', maxWidth: '600px' }}>
              {repoInfo.description}
            </p>
          )}

          {/* ── New File Editor ── */}
          {showEditor && canWrite && (
        <div className="animate-slide-down" style={{
          border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', background: 'var(--bg-default)', marginBottom: '20px',
          boxShadow: '0 0 0 3px rgba(88,166,255,0.1)',
        }}>
          {/* Editor Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-default)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-default)' }}>Create new file</span>
            </div>
            <button onClick={() => { setShowEditor(false); setNewFileName(''); setNewFileContent(''); setSaveError(''); }}
              style={{
                display: 'flex', alignItems: 'center', padding: '4px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--fg-subtle)', borderRadius: '4px',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--fg-default)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-subtle)'}
            >
              <X size={18} />
            </button>
          </div>

          {/* File Name Input */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
                {repoInfo?.title} /
              </span>
              <input
                type="text"
                placeholder="Name your file... (e.g., index.js, README.md)"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                autoFocus
                style={{
                  ...inputStyle,
                  padding: '8px 12px', fontSize: '14px',
                  fontFamily: '"Fira Code", "Cascadia Code", monospace',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Content Editor */}
          <div style={{ position: 'relative' }}>
            <div style={{
              padding: '8px 16px', fontSize: '12px', color: 'var(--fg-muted)',
              background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-muted)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{
                padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                background: 'var(--bg-default)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
              }}>Edit</span>
              <span style={{ fontSize: '12px', color: 'var(--fg-subtle)' }}>
                {newFileContent.split('\n').length} lines · {(new Blob([newFileContent]).size / 1024).toFixed(2)} KB
              </span>
            </div>

            <textarea
              value={newFileContent}
              onChange={e => setNewFileContent(e.target.value)}
              placeholder="Enter file content here..."
              spellCheck={false}
              style={{
                width: '100%', minHeight: '300px', padding: '16px',
                background: 'var(--bg-canvas)', border: 'none',
                color: 'var(--fg-default)', fontSize: '13px',
                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                lineHeight: 1.6, resize: 'vertical', outline: 'none',
                tabSize: 2,
              }}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.target.selectionStart;
                  const end = e.target.selectionEnd;
                  const value = e.target.value;
                  setNewFileContent(value.substring(0, start) + '  ' + value.substring(end));
                  setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; }, 0);
                }
              }}
            />
          </div>

          {/* Error message */}
          {saveError && (
            <div style={{
              padding: '10px 16px', fontSize: '13px',
              color: 'var(--danger)', background: 'var(--danger-subtle)',
              borderTop: '1px solid rgba(248,81,73,0.3)',
            }}>
              {saveError}
            </div>
          )}

          {/* Footer: Commit area */}
          <div style={{
            padding: '16px', background: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
              This will create a new file in {isOwner ? 'your' : 'this'} repository.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowEditor(false); setNewFileName(''); setNewFileContent(''); setSaveError(''); }}
                style={{
                  padding: '8px 16px', fontSize: '13px', fontWeight: 600,
                  background: 'var(--bg-default)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', color: 'var(--fg-default)',
                  cursor: 'pointer', transition: 'all var(--transition-fast)',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
              >Cancel</button>
              <button onClick={handleCreateFile} disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 20px', fontSize: '13px', fontWeight: 600,
                  background: saving ? 'var(--fg-subtle)' : 'var(--success)',
                  border: 'none', borderRadius: 'var(--radius-md)', color: '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-fast)', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <Save size={14} />
                {saving ? 'Committing...' : 'Commit new file'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Tree */}
      <div style={{
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', background: 'var(--bg-default)',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-default)',
          fontSize: '13px', color: 'var(--fg-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} />
            <span>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
          </div>
          {canWrite && !showEditor && (
            <button onClick={() => { setShowEditor(true); setSaveError(''); }} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', fontSize: '11px', fontWeight: 600,
              background: 'var(--bg-default)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--fg-muted)',
              cursor: 'pointer', transition: 'all var(--transition-fast)', fontFamily: 'inherit',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--fg-default)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-muted)'}
            >
              <Plus size={12} /> Add file
            </button>
          )}
        </div>

        {/* Files */}
        {files.length > 0 ? (
          files.map((file, index) => (
            <div key={file._id || index} style={{
              display: 'flex', alignItems: 'center', padding: '10px 16px',
              borderBottom: index < files.length - 1 ? '1px solid var(--border-muted)' : 'none',
              transition: 'background var(--transition-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '28px', flexShrink: 0 }}>
                <FileText size={16} style={{ color: 'var(--fg-subtle)' }} />
              </div>
              <Link to={`/dashboard/repo/${repoId}/blob/${file.fileName || file.name}`} style={{
                fontSize: '14px', color: 'var(--fg-default)',
                textDecoration: 'none', flex: 1,
              }}>
                {file.fileName || file.name}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {file.size && (
                  <span style={{ fontSize: '12px', color: 'var(--fg-subtle)' }}>
                    {file.size} B
                  </span>
                )}
                <span style={{ fontSize: '12px', color: 'var(--fg-subtle)' }}>
                  {file.updatedAt ? new Date(file.updatedAt).toLocaleDateString() : ''}
                </span>
                {/* Only show delete button for owner/collaborator */}
                {canWrite && (
                  <button onClick={() => handleDeleteFile(file._id)}
                    title="Delete file"
                    style={{
                      display: 'flex', alignItems: 'center', padding: '4px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--fg-subtle)', borderRadius: '4px',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-subtle)'}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '50px 16px', textAlign: 'center' }}>
            <FileCode size={40} style={{ color: 'var(--fg-subtle)', marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', color: 'var(--fg-muted)', fontWeight: 500, marginBottom: '6px' }}>
              This repository is empty
            </p>
            <p style={{ fontSize: '13px', color: 'var(--fg-subtle)', marginBottom: '16px' }}>
              {canWrite ? 'Get started by creating a new file.' : 'No files have been added yet.'}
            </p>
            {canWrite && !showEditor && (
              <button onClick={() => { setShowEditor(true); setSaveError(''); }} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 20px', fontSize: '13px', fontWeight: 600,
                background: 'var(--success)', border: 'none',
                borderRadius: 'var(--radius-md)', color: '#fff',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
                fontFamily: 'inherit',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Plus size={16} /> Create new file
              </button>
            )}
          </div>
        )}
      </div>
        </>
      )}

      {/* Collaborate Tab Content */}
      {activeTab === 'collaborate' && (
        <Collaborate 
          repoId={repoId} 
          repoInfo={repoInfo}
          isOwner={isOwner}
          onCollaboratorsUpdate={(updatedCollaborators) => {
            // Update the repoInfo with the new collaborators list
            setRepoInfo(prev => ({
              ...prev,
              collaborators: updatedCollaborators
            }));
          }}
        />
      )}

      {/* Pull Requests Tab Content */}
      {activeTab === 'pullrequests' && (
        <PRList 
          repoId={repoId} 
          repoInfo={repoInfo}
          isOwner={isOwner}
          onCreateNew={() => {
            // TODO: Open PR creation modal/dialog
            alert('PR creation coming soon! For now, collaborate and propose changes.');
          }}
        />
      )}
    </div>
  );
}

export default RepoExplorer;