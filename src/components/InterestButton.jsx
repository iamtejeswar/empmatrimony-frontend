// src/components/InterestButton.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

const btnBase = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
  fontWeight: 600, fontSize: 14, fontFamily: 'Inter, sans-serif',
  transition: 'all 0.2s', border: 'none', whiteSpace: 'nowrap',
};

const btnStyles = {
  send:     { ...btnBase, background: 'linear-gradient(135deg,#c8962d,#f0c050)', color: '#1a1a00' },
  pending:  { ...btnBase, background: 'rgba(245,127,23,0.15)', color: '#f57f17', border: '1px solid rgba(245,127,23,0.3)' },
  accepted: { ...btnBase, background: 'rgba(76,175,80,0.15)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
  rejected: { ...btnBase, background: 'rgba(244,67,54,0.15)', color: '#f44336', border: '1px solid rgba(244,67,54,0.3)' },
  disabled: { ...btnBase, background: 'rgba(255,255,255,0.05)', color: '#666', cursor: 'default' },
};

export default function InterestButton({ profileId }) {
  const [status, setStatus] = useState(null);
  const [interestId, setInterestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => { fetchStatus(); }, [profileId]);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/interests/status/${profileId}`);
      const { sent } = res.data.data;
      if (sent) { setStatus(sent.status); setInterestId(sent.id); }
      else { setStatus(null); setInterestId(null); }
    } catch {}
    finally { setLoading(false); }
  };

  const handleSend = async () => {
    setActing(true);
    try {
      const res = await api.post(`/interests/send/${profileId}`, {});
      setStatus('pending');
      setInterestId(res.data.data.id);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send interest');
    } finally { setActing(false); }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw this interest?')) return;
    setActing(true);
    try {
      await api.delete(`/interests/${interestId}`);
      setStatus(null); setInterestId(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to withdraw');
    } finally { setActing(false); }
  };

  if (loading) return <button style={btnStyles.disabled} disabled>...</button>;

  if (status === 'accepted') return <button style={btnStyles.accepted} disabled>✅ Interest Accepted</button>;
  if (status === 'rejected') return <button style={btnStyles.rejected} disabled>✗ Interest Declined</button>;
  if (status === 'pending') return (
    <button style={btnStyles.pending} onClick={handleWithdraw} disabled={acting}>
      {acting ? '...' : '⏳ Withdraw Interest'}
    </button>
  );
  return (
    <button style={btnStyles.send} onClick={handleSend} disabled={acting}>
      {acting ? 'Sending...' : '💌 Send Interest'}
    </button>
  );
}
