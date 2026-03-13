// src/pages/WhoViewedMePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Eye, User, MapPin, Briefcase, ChevronLeft, ChevronRight, Loader2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

function ViewerCard({ viewer }) {
  return (
    <Link to={`/profile/${viewer.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(26,26,46,0.8)',
        border: '1px solid rgba(200,150,45,0.2)',
        borderRadius: 14,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.25s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(200,150,45,0.5)';
          e.currentTarget.style.background = 'rgba(26,26,46,0.95)';
          e.currentTarget.style.transform = 'translateX(4px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(200,150,45,0.2)';
          e.currentTarget.style.background = 'rgba(26,26,46,0.8)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: viewer.gender === 'female'
            ? 'linear-gradient(135deg,rgba(236,72,153,0.3),rgba(236,72,153,0.1))'
            : 'linear-gradient(135deg,rgba(59,130,246,0.3),rgba(59,130,246,0.1))',
          border: `2px solid ${viewer.gender === 'female' ? 'rgba(236,72,153,0.4)' : 'rgba(59,130,246,0.4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {viewer.profile_picture_url ? (
            <img src={viewer.profile_picture_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={24} color={viewer.gender === 'female' ? 'rgba(236,72,153,0.7)' : 'rgba(59,130,246,0.7)'} />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <h3 style={{
              color: '#f5f0e8', fontSize: 15, fontWeight: 700,
              fontFamily: "'Cormorant Garamond', serif",
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {viewer.first_name} {viewer.last_name?.[0]}.
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <Clock size={11} color="#9a8f7e" />
              <span style={{ fontSize: 11, color: '#9a8f7e', whiteSpace: 'nowrap' }}>{timeAgo(viewer.viewed_at)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 4 }}>
            {viewer.city && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9a8f7e', fontSize: 12 }}>
                <MapPin size={10} color="#c8962d" />
                {viewer.city}{viewer.state ? `, ${viewer.state}` : ''}
              </span>
            )}
            {viewer.job_role && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9a8f7e', fontSize: 12 }}>
                <Briefcase size={10} color="#c8962d" />
                {viewer.job_role}
              </span>
            )}
          </div>
        </div>

        <div style={{ color: '#c8962d', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>View →</div>
      </div>
    </Link>
  );
}

export default function WhoViewedMePage() {
  const [viewers, setViewers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchViewers = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/profile/viewers?page=${page}&limit=20`);
      setViewers(data.data.viewers);
      setPagination(data.data.pagination);
    } catch {
      toast.error('Failed to load viewers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchViewers(1); }, []);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,rgba(200,150,45,0.2),rgba(200,150,45,0.05))',
            border: '1px solid rgba(200,150,45,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Eye size={20} color="#c8962d" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif" }}>
            Who Viewed Me
          </h1>
        </div>
        <p style={{ color: '#9a8f7e', fontSize: 13, marginLeft: 52 }}>
          {pagination.total > 0
            ? `${pagination.total} people have visited your profile`
            : 'See who has been checking out your profile'}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Loader2 size={36} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : viewers.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(26,26,46,0.5)', borderRadius: 20,
          border: '1px solid rgba(200,150,45,0.15)',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>👁️</div>
          <h3 style={{ color: '#f5f0e8', fontSize: 20, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>
            No views yet
          </h3>
          <p style={{ color: '#9a8f7e', fontSize: 14 }}>
            Complete your profile to attract more visitors
          </p>
          <Link to="/profile/edit" style={{
            display: 'inline-block', marginTop: 20,
            background: 'linear-gradient(135deg,#c8962d,#f0c050)',
            color: '#1a1a00', padding: '10px 24px', borderRadius: 10,
            textDecoration: 'none', fontWeight: 700, fontSize: 14,
          }}>
            Complete Profile
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {viewers.map((viewer) => (
              <ViewerCard key={`${viewer.id}-${viewer.viewed_at}`} viewer={viewer} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 28 }}>
              <button
                onClick={() => fetchViewers(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{ background: 'rgba(200,150,45,0.1)', border: '1px solid rgba(200,150,45,0.3)', color: '#c8962d', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', opacity: pagination.page === 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: '#9a8f7e', fontSize: 14 }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchViewers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{ background: 'rgba(200,150,45,0.1)', border: '1px solid rgba(200,150,45,0.3)', color: '#c8962d', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', opacity: pagination.page === pagination.totalPages ? 0.4 : 1 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
