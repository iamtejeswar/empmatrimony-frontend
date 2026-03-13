// src/pages/DashboardPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, User, CheckCircle, Clock, Heart, Star, ArrowRight, Camera, Upload } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STEPS = [
  { step: 1, label: 'Personal Details',   desc: 'Height, marital status, about you' },
  { step: 2, label: 'Family Details',     desc: 'Family background and location' },
  { step: 3, label: 'Education & Career', desc: 'Education and job details' },
  { step: 4, label: 'Community',          desc: 'Religion, caste, horoscope' },
  { step: 5, label: 'Documents',          desc: 'Profile photo and documents' },
];

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [interests, setInterests] = useState({ received: 0, sent: 0 });
  const fileInputRef = useRef();

  const completionStep = user?.profileCompletionStep || 0;
  const completionPercent = Math.round(completionStep / 5 * 100);
  const completedSteps = STEPS.filter(s => s.step <= completionStep);
  const pendingSteps = STEPS.filter(s => s.step > completionStep);

  useEffect(() => {
    // Load interest counts
    Promise.all([
      api.get('/interests/received?status=pending&limit=1'),
      api.get('/interests/sent?status=all&limit=1'),
    ]).then(([rec, sent]) => {
      setInterests({ received: rec.data.total || 0, sent: sent.data.total || 0 });
    }).catch(() => {});

    // Load profile picture
    api.get('/profile').then(({ data }) => {
      const pic = data?.data?.profile?.personalDetails?.profilePictureUrl;
      if (pic) setPhotoUrl(pic);
    }).catch(() => {});
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await api.post('/documents/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotoUrl(res.data.data.url);
      toast.success('Profile photo uploaded!');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const quickActions = [
    { to: '/search',    icon: Search, label: 'Find Matches',    desc: 'Search for your ideal partner', color: '#c8962d' },
    { to: '/interests', icon: Heart,  label: 'My Interests',    desc: `${interests.received} pending requests`, color: '#ec4899' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26,35,126,0.8) 0%, rgba(200,150,45,0.2) 100%)',
        border: '1px solid rgba(200,150,45,0.3)', borderRadius: 24,
        padding: '40px', marginBottom: 32, position: 'relative', overflow: 'hidden',
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
                : <User size={40} color="#c8962d" />}
            </div>
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
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ color: '#c8962d', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Welcome back</p>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#f5f0e8', fontFamily: "'Cormorant Garamond', serif", marginBottom: 8 }}>
              {user?.firstName} {user?.lastName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {user?.accountStatus === 'active'
                  ? <><CheckCircle size={16} color="#22c55e" /><span style={{ color: '#22c55e', fontSize: 14 }}>Account Active</span></>
                  : <><Clock size={16} color="#f59e0b" /><span style={{ color: '#f59e0b', fontSize: 14 }}>Pending Approval</span></>}
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

          {/* Completion Ring */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 90, height: 90 }}>
              <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <circle cx="45" cy="45" r="38" fill="none"
                  stroke={completionPercent === 100 ? '#22c55e' : '#c8962d'}
                  strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - completionPercent / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: completionPercent === 100 ? '#22c55e' : '#f0c050', fontFamily: "'Cormorant Garamond', serif" }}>{completionPercent}%</span>
              </div>
            </div>
            <p style={{ color: '#9a8f7e', fontSize: 11, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>Profile</p>
          </div>
        </div>
      </div>

      {/* Profile Completion Steps */}
      <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.25)', borderRadius: 20, padding: 28, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#f5f0e8', fontSize: 18, fontWeight: 700 }}>Profile Completion</h3>
          <span style={{ color: completionPercent === 100 ? '#22c55e' : '#f0c050', fontSize: 15, fontWeight: 700 }}>
            {completionStep}/5 sections done
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{
            height: '100%', width: `${completionPercent}%`,
            background: completionPercent === 100
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : 'linear-gradient(90deg, #c8962d, #f0c050)',
            borderRadius: 10, transition: 'width 0.8s ease',
          }} />
        </div>

        {/* Steps Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          {STEPS.map(({ step, label }) => {
            const done = step <= completionStep;
            const current = step === completionStep + 1;
            return (
              <div key={step} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: done ? 'rgba(34,197,94,0.15)' : current ? 'rgba(200,150,45,0.15)' : 'rgba(255,255,255,0.05)',
                  border: done ? '2px solid #22c55e' : current ? '2px solid #c8962d' : '2px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  color: done ? '#22c55e' : current ? '#c8962d' : '#555',
                }}>
                  {done ? '✓' : step}
                </div>
                <span style={{ fontSize: 10, color: done ? '#22c55e' : current ? '#c8962d' : '#555', textAlign: 'center', lineHeight: 1.3 }}>
                  {label.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Next Step CTA */}
        {completionPercent < 100 ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#9a8f7e', fontSize: 13 }}>
                Next: <span style={{ color: '#f0c050' }}>{STEPS[completionStep]?.label}</span>
                {' — '}{STEPS[completionStep]?.desc}
              </p>
            </div>
            <Link to="/profile/complete" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg,#c8962d,#f0c050)',
              color: '#1a1a00', padding: '10px 20px', borderRadius: 10,
              fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}>
              Continue <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={20} color="#22c55e" />
            <span style={{ color: '#22c55e', fontWeight: 600 }}>Profile 100% complete! You're getting more visibility.</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { icon: Heart,  label: 'Interests Received', value: interests.received, color: '#ec4899', to: '/interests' },
          { icon: Star,   label: 'Interests Sent',     value: interests.sent,     color: '#f59e0b', to: '/interests' },
          { icon: Search, label: 'Profile Views',      value: '—',                color: '#60a5fa', to: null },
        ].map(({ icon: Icon, label, value, color, to }) => (
          <Link key={label} to={to || '#'} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, padding: 24, cursor: to ? 'pointer' : 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
                <span style={{ color: '#9a8f7e', fontSize: 13 }}>{label}</span>
              </div>
              <p style={{ color: '#f5f0e8', fontSize: 28, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{value}</p>
              {to
                ? <p style={{ color: '#c8962d', fontSize: 12, marginTop: 4 }}>View all →</p>
                : <p style={{ color: '#5a5050', fontSize: 12, marginTop: 4 }}>Coming in Phase 2</p>}
            </div>
          </Link>
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
