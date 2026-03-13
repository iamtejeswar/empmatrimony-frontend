// src/pages/InterestsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const tabs = [
  { key: 'received_pending', label: '📩 Received', path: '/interests/received?status=pending' },
  { key: 'received_accepted', label: '✅ Accepted', path: '/interests/received?status=accepted' },
  { key: 'sent', label: '💌 Sent', path: '/interests/sent?status=all' },
];

function getAge(dob) {
  if (!dob) return '';
  return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)) + ' yrs';
}

export default function InterestsPage() {
  const [activeTab, setActiveTab] = useState('received_pending');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterests();
  }, [activeTab]);

  const fetchInterests = async () => {
    setLoading(true);
    setInterests([]);
    try {
      const tab = tabs.find(t => t.key === activeTab);
      const res = await api.get(`${tab.path}&limit=20`);
      setInterests(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (interestId, action) => {
    setActing(interestId);
    try {
      await api.patch(`/interests/${interestId}/respond`, { action });
      fetchInterests();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    } finally {
      setActing(null);
    }
  };

  const getProfile = (item) => item.sender || item.receiver;
  const isSentTab = activeTab === 'sent';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", marginBottom: 24 }}>
        💌 My Interests
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(200,150,45,0.2)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 700 : 400,
              color: activeTab === tab.key ? '#f0c050' : '#9a8f7e',
              borderBottom: activeTab === tab.key ? '2px solid #c8962d' : '2px solid transparent',
              marginBottom: -1,
              fontSize: 15,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9a8f7e' }}>Loading...</div>
      ) : interests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9a8f7e' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💌</div>
          <p>No interests here yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {interests.map(item => {
            const profile = getProfile(item);
            const pd = profile?.personalDetails;
            const fd = profile?.familyDetails;
            const ed = profile?.employmentDetails;
            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(26,26,46,0.8)',
                  border: '1px solid rgba(200,150,45,0.2)',
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                {/* Avatar */}
                <div
                  onClick={() => navigate(`/profile/${profile?.id}`)}
                  style={{
                    width: 70, height: 70, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(200,150,45,0.1)',
                    border: '2px solid rgba(200,150,45,0.3)',
                    overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {pd?.profile_picture_url ? (
                    <img src={pd.profile_picture_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 28 }}>{profile?.gender === 'female' ? '👩' : '👨'}</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontWeight: 700, fontSize: 17, color: '#f0c050', cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif" }}
                    onClick={() => navigate(`/profile/${profile?.id}`)}
                  >
                    {profile?.first_name} {profile?.last_name}
                  </div>
                  <div style={{ color: '#9a8f7e', fontSize: 13, marginTop: 3, fontFamily: 'Inter, sans-serif' }}>
                    {getAge(profile?.date_of_birth)}
                    {fd?.city && ` • ${fd.city}`}
                    {ed?.job_role && ` • ${ed.job_role}`}
                  </div>
                  {item.message && (
                    <div style={{ marginTop: 6, fontSize: 13, color: '#9a8f7e', fontStyle: 'italic', background: 'rgba(200,150,45,0.05)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(200,150,45,0.1)' }}>
                      "{item.message}"
                    </div>
                  )}
                  <div style={{ marginTop: 4, fontSize: 12, color: '#666', fontFamily: 'Inter, sans-serif' }}>
                    {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  {activeTab === 'received_pending' && (
                    <>
                      <button
                        onClick={() => handleRespond(item.id, 'accepted')}
                        disabled={acting === item.id}
                        style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'rgba(76,175,80,0.2)', color: '#4caf50', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif', border: '1px solid rgba(76,175,80,0.3)' }}
                      >
                        {acting === item.id ? '...' : '✓ Accept'}
                      </button>
                      <button
                        onClick={() => handleRespond(item.id, 'rejected')}
                        disabled={acting === item.id}
                        style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(244,67,54,0.3)', background: 'rgba(244,67,54,0.1)', color: '#f44336', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif' }}
                      >
                        ✗ Decline
                      </button>
                    </>
                  )}
                  {activeTab === 'received_accepted' && (
                    <span style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(76,175,80,0.1)', color: '#4caf50', fontWeight: 600, fontSize: 14, border: '1px solid rgba(76,175,80,0.2)' }}>
                      ✅ Accepted
                    </span>
                  )}
                  {isSentTab && (
                    <span style={{
                      padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: 14, fontFamily: 'Inter, sans-serif',
                      background: item.status === 'accepted' ? 'rgba(76,175,80,0.1)' : item.status === 'rejected' ? 'rgba(244,67,54,0.1)' : 'rgba(245,127,23,0.1)',
                      color: item.status === 'accepted' ? '#4caf50' : item.status === 'rejected' ? '#f44336' : '#f57f17',
                      border: item.status === 'accepted' ? '1px solid rgba(76,175,80,0.2)' : item.status === 'rejected' ? '1px solid rgba(244,67,54,0.2)' : '1px solid rgba(245,127,23,0.2)',
                    }}>
                      {item.status === 'accepted' ? '✅ Accepted' : item.status === 'rejected' ? '✗ Declined' : '⏳ Pending'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
