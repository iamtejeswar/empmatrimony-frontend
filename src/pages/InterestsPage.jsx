// src/pages/InterestsPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

const tabs = [
  { key: 'received_pending', label: '📩 Received', api: '/interests/received?status=pending' },
  { key: 'received_accepted', label: '✅ Accepted', api: '/interests/received?status=accepted' },
  { key: 'sent', label: '💌 Sent', api: '/interests/sent?status=all' },
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
      const token = localStorage.getItem('token');
      const tab = tabs.find(t => t.key === activeTab);
      const res = await axios.get(`${API}${tab.api}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/interests/${interestId}/respond`, { action }, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    <div style={{ minHeight: '100vh', background: '#f8f4f0', padding: '24px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a237e', marginBottom: 24 }}>
          💌 My Interests
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #e0e0e0' }}>
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
                color: activeTab === tab.key ? '#1a237e' : '#666',
                borderBottom: activeTab === tab.key ? '3px solid #1a237e' : '3px solid transparent',
                marginBottom: -2,
                fontSize: 15,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Loading...</div>
        ) : interests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
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
                    background: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Avatar */}
                  <div
                    onClick={() => navigate(`/profile/${profile?.id}`)}
                    style={{
                      width: 70, height: 70, borderRadius: '50%', flexShrink: 0,
                      background: '#e8eaf6', overflow: 'hidden', cursor: 'pointer',
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
                      style={{ fontWeight: 700, fontSize: 17, color: '#1a237e', cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${profile?.id}`)}
                    >
                      {profile?.first_name} {profile?.last_name}
                    </div>
                    <div style={{ color: '#666', fontSize: 13, marginTop: 3 }}>
                      {getAge(profile?.date_of_birth)}
                      {fd?.city && ` • ${fd.city}`}
                      {ed?.job_role && ` • ${ed.job_role}`}
                    </div>
                    {item.message && (
                      <div style={{ marginTop: 6, fontSize: 13, color: '#555', fontStyle: 'italic', background: '#f5f5f5', padding: '6px 10px', borderRadius: 8 }}>
                        "{item.message}"
                      </div>
                    )}
                    <div style={{ marginTop: 4, fontSize: 12, color: '#aaa' }}>
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
                          style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#4caf50', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                        >
                          {acting === item.id ? '...' : '✓ Accept'}
                        </button>
                        <button
                          onClick={() => handleRespond(item.id, 'rejected')}
                          disabled={acting === item.id}
                          style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#f44336', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                        >
                          ✗ Decline
                        </button>
                      </>
                    )}
                    {activeTab === 'received_accepted' && (
                      <span style={{ padding: '8px 18px', borderRadius: 8, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14 }}>
                        ✅ Accepted
                      </span>
                    )}
                    {isSentTab && (
                      <span style={{
                        padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                        background: item.status === 'accepted' ? '#e8f5e9' : item.status === 'rejected' ? '#ffebee' : '#fff8e1',
                        color: item.status === 'accepted' ? '#2e7d32' : item.status === 'rejected' ? '#c62828' : '#f57f17',
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
    </div>
  );
}
