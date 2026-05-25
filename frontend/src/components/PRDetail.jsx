import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GitMerge, Check, MessageSquare, AlertCircle, Trash2, X, ArrowLeft, Lock } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../store/authStore.js';

function PRDetail() {
  const { repoId, prId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [pr, setPR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('commented');
  const [reviewText, setReviewText] = useState('');
  const [merging, setMerging] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mergeError, setMergeError] = useState(null);

  useEffect(() => {
    const fetchPR = async () => {
      try {
        const res = await axiosInstance.get(`/pullrequest-api/${prId}`);
        setPR(res.data.payload);
      } catch (err) {
        console.error('Error fetching PR', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPR();
  }, [prId]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const res = await axiosInstance.post(`/pullrequest-api/${prId}/comments`, {
        content: commentText
      });
      setPR(res.data.payload);
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleReview = async () => {
    setReviewing(true);
    try {
      const res = await axiosInstance.post(`/pullrequest-api/${prId}/review`, {
        decision: reviewDecision,
        comment: reviewText
      });
      setPR(res.data.payload);
      setReviewText('');
      setReviewDecision('commented');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  const handleMerge = async () => {
    if (!window.confirm('Are you sure you want to merge this PR?')) return;
    setMerging(true);
    setMergeError(null);
    try {
      const res = await axiosInstance.post(`/pullrequest-api/${prId}/merge`);
      setPR(res.data.payload);
      alert('Pull request merged successfully!');
    } catch (err) {
      const errorData = err.response?.data;
      setMergeError({
        message: errorData?.message || 'Failed to merge PR',
        reason: errorData?.reason || '',
        conflicts: errorData?.conflicts || [],
        requiresApproval: errorData?.requiresApproval || false
      });
    } finally {
      setMerging(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Are you sure you want to close this PR?')) return;
    setClosing(true);
    try {
      const res = await axiosInstance.post(`/pullrequest-api/${prId}/close`);
      setPR(res.data.payload);
      alert('Pull request closed');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close PR');
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ height: '20px', background: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '24px' }} />
        <div style={{ height: '200px', background: 'var(--bg-subtle)', borderRadius: '8px' }} />
      </div>
    );
  }

  if (!pr) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', fontSize: '16px' }}>Pull request not found</p>
        <Link to={`/dashboard/repo/${repoId}`} style={{
          display: 'inline-block',
          marginTop: '16px',
          padding: '8px 16px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--fg-default)',
          textDecoration: 'none',
          fontSize: '13px'
        }}>
          Back to Repository
        </Link>
      </div>
    );
  }

  const isAuthor = isAuthenticated && currentUser?._id === pr.author?._id;
  const isOwner = isAuthenticated && currentUser?._id === pr.repository?.owner?._id;
  const canReview = isOwner;
  const canMerge = isOwner && pr.status === 'open';

  const statusColors = {
    open: { bg: 'var(--success-subtle)', color: 'var(--success)', border: 'rgba(63,185,80,0.3)' },
    closed: { bg: 'var(--danger-subtle)', color: 'var(--danger)', border: 'rgba(248,81,73,0.3)' },
    merged: { bg: 'var(--purple-subtle)', color: 'var(--purple)', border: 'rgba(188,140,255,0.3)' }
  };

  const statusColor = statusColors[pr.status] || statusColors.open;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate(`/dashboard/repo/${repoId}`)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--fg-muted)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--fg-default)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fg-muted)'}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--fg-default)', margin: 0 }}>
          {pr.title}
        </h1>
        <span style={{
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: '600',
          background: statusColor.bg,
          color: statusColor.color,
          border: `1px solid ${statusColor.border}`,
          borderRadius: '12px',
          textTransform: 'capitalize'
        }}>
          {pr.status}
        </span>
      </div>

      {/* PR Info */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        fontSize: '13px',
        color: 'var(--fg-muted)'
      }}>
        <span>#{pr._id.slice(-6)}</span>
        <span>·</span>
        <span>by <strong>{pr.author?.name || 'Unknown'}</strong></span>
        <span>·</span>
        <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Left Column */}
        <div>
          {/* Description */}
          {pr.description && (
            <div style={{
              background: 'var(--bg-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '14px', color: 'var(--fg-default)', lineHeight: 1.6, margin: 0 }}>
                {pr.description}
              </p>
            </div>
          )}

          {/* Changes */}
          {pr.changes && pr.changes.length > 0 && (
            <div style={{
              background: 'var(--bg-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '16px',
                background: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border-default)',
                fontWeight: '600',
                fontSize: '13px'
              }}>
                Files Changed ({pr.changes.length})
              </div>
              {pr.changes.map((change, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderBottom: i < pr.changes.length - 1 ? '1px solid var(--border-muted)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    background: change.status === 'added' ? 'var(--success-subtle)' :
                               change.status === 'deleted' ? 'var(--danger-subtle)' :
                               'var(--warning-subtle)',
                    color: change.status === 'added' ? 'var(--success)' :
                           change.status === 'deleted' ? 'var(--danger)' :
                           'var(--warning)',
                    textTransform: 'uppercase'
                  }}>
                    {change.status[0]}
                  </span>
                  <span style={{ color: 'var(--fg-default)' }}>{change.fileName}</span>
                  {change.additions > 0 && (
                    <span style={{ color: 'var(--success)', fontSize: '11px' }}>
                      +{change.additions}
                    </span>
                  )}
                  {change.deletions > 0 && (
                    <span style={{ color: 'var(--danger)', fontSize: '11px' }}>
                      -{change.deletions}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          {pr.reviews && pr.reviews.length > 0 && (
            <div style={{
              background: 'var(--bg-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '16px',
                background: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border-default)',
                fontWeight: '600',
                fontSize: '13px'
              }}>
                Reviews ({pr.reviews.length})
              </div>
              {pr.reviews.map((review, i) => (
                <div key={i} style={{
                  padding: '14px 16px',
                  borderBottom: i < pr.reviews.length - 1 ? '1px solid var(--border-muted)' : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <strong style={{ fontSize: '12px', color: 'var(--fg-default)' }}>
                      {review.reviewer?.name || 'Unknown'}
                    </strong>
                    <span style={{
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: '600',
                      background: review.decision === 'approved' ? 'var(--success-subtle)' :
                                 review.decision === 'changes_requested' ? 'var(--danger-subtle)' :
                                 'var(--warning-subtle)',
                      color: review.decision === 'approved' ? 'var(--success)' :
                             review.decision === 'changes_requested' ? 'var(--danger)' :
                             'var(--warning)',
                      borderRadius: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {review.decision.replace('_', ' ')}
                    </span>
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: 0 }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Comments */}
          {pr.comments && pr.comments.length > 0 && (
            <div style={{
              background: 'var(--bg-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '16px',
                background: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border-default)',
                fontWeight: '600',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <MessageSquare size={14} />
                Comments ({pr.comments.length})
              </div>
              {pr.comments.map((comment, i) => (
                <div key={i} style={{
                  padding: '14px 16px',
                  borderBottom: i < pr.comments.length - 1 ? '1px solid var(--border-muted)' : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <strong style={{ fontSize: '12px', color: 'var(--fg-default)' }}>
                      {comment.author?.name || 'Unknown'}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--fg-subtle)' }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: 0 }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          {isAuthenticated && (
            <div style={{
              background: 'var(--bg-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px'
            }}>
              <textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--fg-default)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-default)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={handleAddComment}
                  disabled={commenting || !commentText.trim()}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: commentText.trim() ? 'var(--accent-primary)' : 'var(--fg-subtle)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: commentText.trim() && !commenting ? 'pointer' : 'not-allowed',
                    transition: 'opacity var(--transition-fast)',
                    fontFamily: 'inherit',
                    opacity: commenting ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (commentText.trim() && !commenting) e.currentTarget.style.opacity = '0.85';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = commenting ? '0.7' : '1';
                  }}
                >
                  {commenting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div>
          {/* Actions */}
          <div style={{
            background: 'var(--bg-default)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-default)',
              fontWeight: '600',
              fontSize: '12px'
            }}>
              Actions
            </div>

            {canReview && pr.status === 'open' && (
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--fg-default)'
                  }}>
                    Review Decision
                  </label>
                  <select
                    value={reviewDecision}
                    onChange={(e) => setReviewDecision(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--fg-default)',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="commented">Comment</option>
                    <option value="approved">Approve</option>
                    <option value="changes_requested">Request Changes</option>
                  </select>
                </div>

                <textarea
                  placeholder="Add a review comment..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '8px',
                    fontSize: '12px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--fg-default)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    marginBottom: '10px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-default)';
                  }}
                />

                <button
                  onClick={handleReview}
                  disabled={reviewing}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: reviewing ? 'not-allowed' : 'pointer',
                    opacity: reviewing ? 0.7 : 1,
                    transition: 'opacity var(--transition-fast)',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!reviewing) e.currentTarget.style.opacity = '0.85';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = reviewing ? '0.7' : '1';
                  }}
                >
                  {reviewing ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}

            {canMerge && (
              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-muted)' }}>
                {/* Merge Requirements */}
                {pr.status === 'open' && (
                  <div style={{ marginBottom: '16px' }}>
                    {/* Approval Status */}
                    <div style={{
                      padding: '12px 16px',
                      marginBottom: '12px',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Check size={16} style={{ color: pr.reviews?.some(r => r.decision === 'approved') ? 'var(--success)' : 'var(--fg-subtle)' }} />
                        <span style={{ fontWeight: '600' }}>Approval</span>
                        <span style={{ 
                          marginLeft: 'auto',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          background: pr.reviews?.some(r => r.decision === 'approved') ? 'var(--success-subtle)' : 'var(--warning-subtle)',
                          color: pr.reviews?.some(r => r.decision === 'approved') ? 'var(--success)' : 'var(--warning)'
                        }}>
                          {pr.reviews?.some(r => r.decision === 'approved') ? '✓ Approved' : '⚠ Pending'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '0' }}>
                        {pr.reviews?.some(r => r.decision === 'approved') 
                          ? 'This PR has been approved and is ready to merge'
                          : 'This PR requires approval from the repository owner before it can be merged'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Merge Error Message */}
                {mergeError && (
                  <div style={{
                    padding: '12px 16px',
                    marginBottom: '16px',
                    background: 'var(--danger-subtle)',
                    border: '1px solid rgba(248,81,73,0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--danger)',
                    fontSize: '13px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                      {mergeError.requiresApproval ? <Lock size={16} /> : <AlertCircle size={16} />}
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{mergeError.message}</div>
                        {mergeError.reason && (
                          <div style={{ fontSize: '12px', color: 'var(--danger)', opacity: 0.9 }}>
                            {mergeError.reason}
                          </div>
                        )}
                        {mergeError.conflicts && mergeError.conflicts.length > 0 && (
                          <div style={{ marginTop: '8px', fontSize: '12px' }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Conflicts detected:</div>
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                              {mergeError.conflicts.map((conflict, i) => (
                                <li key={i}>{conflict.fileName}: {conflict.message}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Merge Button */}
                <button
                  onClick={handleMerge}
                  disabled={merging || !pr.reviews?.some(r => r.decision === 'approved')}
                  title={!pr.reviews?.some(r => r.decision === 'approved') ? 'This PR needs approval before merging' : ''}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    background: !pr.reviews?.some(r => r.decision === 'approved') ? 'var(--fg-subtle)' : 'var(--success)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: merging || !pr.reviews?.some(r => r.decision === 'approved') ? 'not-allowed' : 'pointer',
                    opacity: merging || !pr.reviews?.some(r => r.decision === 'approved') ? 0.7 : 1,
                    transition: 'opacity var(--transition-fast)',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!merging && pr.reviews?.some(r => r.decision === 'approved')) e.currentTarget.style.opacity = '0.85';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = merging || !pr.reviews?.some(r => r.decision === 'approved') ? '0.7' : '1';
                  }}
                >
                  <GitMerge size={14} />
                  {merging ? 'Merging...' : 'Merge Pull Request'}
                </button>
              </div>
            )}

            {pr.status === 'open' && (isAuthor || isOwner) && (
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-muted)' }}>
                <button
                  onClick={handleClose}
                  disabled={closing}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: 'var(--danger-subtle)',
                    color: 'var(--danger)',
                    border: '1px solid rgba(248,81,73,0.3)',
                    borderRadius: 'var(--radius-md)',
                    cursor: closing ? 'not-allowed' : 'pointer',
                    opacity: closing ? 0.7 : 1,
                    transition: 'opacity var(--transition-fast)',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!closing) e.currentTarget.style.opacity = '0.85';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = closing ? '0.7' : '1';
                  }}
                >
                  <X size={14} />
                  {closing ? 'Closing...' : 'Close Pull Request'}
                </button>
              </div>
            )}
          </div>

          {/* Author Info */}
          <div style={{
            background: 'var(--bg-default)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: 'var(--fg-muted)' }}>
              Author
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--fg-default)'
              }}>
                {pr.author?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--fg-default)' }}>
                  {pr.author?.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--fg-subtle)' }}>
                  {pr.author?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PRDetail;
