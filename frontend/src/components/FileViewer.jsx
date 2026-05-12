import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { FileCode, Copy, Check } from 'lucide-react';

function FileViewer() {
  const { repoId, "*": filePath } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const res = await axiosInstance.get(`/file-api/${repoId}`, {
          params: { path: filePath },
        });
        setContent(res.data.content || '');
      } catch (err) {
        console.error("Error fetching file content", err);
        setContent('// Error: Could not load file content');
      } finally {
        setLoading(false);
      }
    };
    fetchFileContent();
  }, [repoId, filePath]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      <div className="skeleton" style={{ height: '20px', width: '50%', marginBottom: '16px' }}></div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div className="skeleton" style={{ height: '40px', borderRadius: 0 }}></div>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="skeleton" style={{ height: '20px', margin: '4px 16px', borderRadius: '4px' }}></div>
        ))}
      </div>
    </div>
  );

  const lines = content.split('\n');

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '16px' }}>
        <Link to={`/dashboard/repo/${repoId}`} style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Repository
        </Link>
        <span style={{ color: 'var(--fg-subtle)' }}>/</span>
        <span style={{ color: 'var(--fg-default)', fontFamily: 'monospace' }}>{filePath}</span>
      </nav>

      {/* File Card */}
      <div style={{
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', background: 'var(--bg-default)',
      }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 16px', background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-default)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-muted)' }}>
            <FileCode size={16} style={{ color: 'var(--fg-subtle)' }} />
            <span>{lines.length} lines</span>
            <span style={{ color: 'var(--fg-subtle)' }}>·</span>
            <span>{(new Blob([content]).size / 1024).toFixed(2)} KB</span>
          </div>
          <button onClick={copyToClipboard} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', fontSize: '12px', fontWeight: 500,
            background: copied ? 'var(--success-subtle)' : 'var(--bg-default)',
            border: `1px solid ${copied ? 'var(--success)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            color: copied ? 'var(--success)' : 'var(--fg-muted)',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
            fontFamily: 'inherit',
          }}>
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>

        {/* Code Block */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '13px', fontFamily: '"Fira Code", "Cascadia Code", monospace', borderCollapse: 'collapse' }}>
            <tbody>
              {lines.map((line, index) => (
                <tr key={index} style={{ transition: 'background var(--transition-fast)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,166,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{
                    width: '50px', textAlign: 'right', paddingRight: '16px',
                    color: 'var(--fg-subtle)', userSelect: 'none',
                    borderRight: '1px solid var(--border-muted)',
                    background: 'var(--bg-subtle)', padding: '2px 16px 2px 0',
                    fontSize: '12px',
                  }}>
                    {index + 1}
                  </td>
                  <td style={{
                    paddingLeft: '16px', whiteSpace: 'pre',
                    color: 'var(--fg-default)', padding: '2px 16px',
                  }}>
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FileViewer;