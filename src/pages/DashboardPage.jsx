// src/pages/DashboardPage.jsx
import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, User, CheckCircle, Clock, Heart, Star, ArrowRight, Camera, Upload } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://empmatrimony-backend-production.up.railway.app/api/v1';

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const completionPercent = Math.round((user?.profileCompletionStep || 0) / 5 * 100);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_URL}/documents/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setPhotoUrl(res.data.data.url);
      toast.success('Profile photo uploaded!');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const quickActions = [
    { to: '/search', icon: Search, label: 'Find Matches', desc: 'Search for your ideal partner', color: '#c8962d' },
    { to: '/profile/complete', icon: User, label: 'Complete Profile', desc: 'Improve your visibility', color: '#60a5fa' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26,35,126,0.8) 0%, rgba(200,150,45,0.2) 100%)',
        border: '1px solid rgba(200,150,45,0.3)', borderRadius: 24,
        padding: '40px 40px', marginBottom: 32, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(200,150,45,0.08)' }} />
        <div style={{ position: 'absolute', right: 40, bottom: -60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(200,150,45,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 28 }}>
          {/* Profile Photo */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              border: '3px solid rgba(200,150,45,0.6)',
              overflow: 'hidden', background: 'rgba(200,150,45,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {photoUrl
                ? <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={40} color="#c8962d" />
              }
            </div>
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: uploading ? '#888' : 'linear-gradient(135deg,#c8962d,#f0c050)',
                border: '2px solid #1a1a2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              {uploading ? '...' : <Camera size={13} color="#1a1a00" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </div>

          <div>
            <p style={{ color: '#c8962d', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Welcome back</p>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#f5f0e8', fontFamily: "'Cormorant Garamond', serif", marginBottom: 8 }}>
              {user?.firstName} {user?.lastName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {user?.accountStatus === 'active'
                  ? <><CheckCircle size={16} color="#22c55e" /> <span style={{ color: '#22c55e', fontSize: 14 }}>Account Active</span></>
                  : <><Clock size={16} color="#f59e0b" /> <span style={{ color: '#f59e0b', fontSize: 14 }}>Pending Approval</span></>}
              </div>
              <div style={{ color: '#9a8f7e', fontSize: 14 }}>
                Plan: <span style={{ color: '#f0c050', textTransform: 'capitalize' }}>{user?.subscriptionPlan || 'Free'}</span>
              </div>
            </div>
            {!photoUrl && (
              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(200,150,45,0.15)', border: '1px dashed rgba(200,150,45,0.5)',
                  color: '#c8962d', padding: '7px 14px', borderRadius: 8, fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Upload size={14} /> Upload Profile Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      {!user?.isProfileComplete && (
        <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.25)', borderRadius: 20, padding: 28, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ color: '#f5f0e8', fontSize: 18, fontWeight: 700 }}>Profile Completion</h3>
            <span style={{ color: '#f0c050', fontSize: 24, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{completionPercent}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', width: `${completionPercent}%`, background: 'linear-gradient(90deg, #c8962d, #f0c050)', borderRadius: 10, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#9a8f7e', fontSize: 14 }}>Complete your profile to get more matches</p>
            <Link to="/profile/complete" style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#c8962d,#f0c050)',
              color: '#1a1a00', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}>
              Continue <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { icon: Heart, label: 'Profile Views', value: '—', color: '#ec4899' },
          { icon: Star, label: 'Interests Received', value: '—', color: '#f59e0b' },
          { icon: Search, label: 'Searches Appeared', value: '—', color: '#60a5fa' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
              <span style={{ color: '#9a8f7e', fontSize: 13 }}>{label}</span>
            </div>
            <p style={{ color: '#f5f0e8', fontSize: 28, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{value}</p>
            <p style={{ color: '#5a5050', fontSize: 12, marginTop: 4 }}>Upgrade to Premium to see stats</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {quickActions.map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)',
              borderRadius: 16, padding: 28, display: 'flex', alignItems: 'center', gap: 20,
              transition: 'all 0.2s', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,150,45,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,150,45,0.2)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={26} color={color} />
              </div>
              <div>
                <h3 style={{ color: '#f5f0e8', fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{label}</h3>
                <p style={{ color: '#9a8f7e', fontSize: 13 }}>{desc}</p>
              </div>
              <ArrowRight size={18} color="#9a8f7e" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
