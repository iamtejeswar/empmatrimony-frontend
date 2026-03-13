// src/components/InterestButton.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

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
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/interests/status/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { sent } = res.data.data;
      if (sent) {
        setStatus(sent.status);
        setInterestId(sent.id);
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
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/interests/send/${profileId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/interests/${interestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(null);
      setInterestId(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to withdraw');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <button className={`btn-interest disabled ${className}`} disabled>...</button>;

  if (status === 'accepted') {
    return (
      <button className={`btn-interest accepted ${className}`} disabled>
        ✅ Interest Accepted
      </button>
    );
  }

  if (status === 'rejected') {
    return (
      <button className={`btn-interest rejected ${className}`} disabled>
        ✗ Interest Declined
      </button>
    );
  }

  if (status === 'pending') {
    return (
      <button
        className={`btn-interest pending ${className}`}
        onClick={handleWithdraw}
        disabled={acting}
      >
        {acting ? '...' : '⏳ Withdraw Interest'}
      </button>
    );
  }

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
