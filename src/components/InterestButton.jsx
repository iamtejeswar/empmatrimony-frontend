// src/components/InterestButton.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function InterestButton({ profileId, className = '' }) {
  const [status, setStatus] = useState(null); // null | 'pending' | 'accepted' | 'rejected'
  const [interestId, setInterestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [profileId]);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/interests/status/${profileId}`);
      const { sent } = res.data.data;
      if (sent) {
        setStatus(sent.status);
        setInterestId(sent.id);
      } else {
        setStatus(null);
        setInterestId(null);
      }
    } catch (e) {
      // not logged in or error
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setActing(true);
    try {
      const res = await api.post(`/interests/send/${profileId}`, {});
      setStatus('pending');
      setInterestId(res.data.data.id);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send interest');
    } finally {
      setActing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw this interest?')) return;
    setActing(true);
    try {
      await api.delete(`/interests/${interestId}`);
      setStatus(null);
      setInterestId(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to withdraw');
    } finally {
      setActing(false);
    }
  };

  if (loading) return (
    <button className={`btn-interest disabled ${className}`} disabled>...</button>
  );

  if (status === 'accepted') return (
    <button className={`btn-interest accepted ${className}`} disabled>
      ✅ Interest Accepted
    </button>
  );

  if (status === 'rejected') return (
    <button className={`btn-interest rejected ${className}`} disabled>
      ✗ Interest Declined
    </button>
  );

  if (status === 'pending') return (
    <button
      className={`btn-interest pending ${className}`}
      onClick={handleWithdraw}
      disabled={acting}
    >
      {acting ? '...' : '⏳ Withdraw Interest'}
    </button>
  );

  return (
    <button
      className={`btn-interest send ${className}`}
      onClick={handleSend}
      disabled={acting}
    >
      {acting ? 'Sending...' : '💌 Send Interest'}
    </button>
  );
}
