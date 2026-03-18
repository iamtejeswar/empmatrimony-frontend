// src/pages/ProfileViewPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { profileAPI } from '../services/api';
import api from '../services/api';
import { ArrowLeft, User, MapPin, Briefcase, Star, Loader2, MoreVertical, Ban, Flag, X, MessageCircle } from 'lucide-react';
import InterestButton from '../components/InterestButton';
import toast from 'react-hot-toast';

const REPORT_REASONS = [
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'scam', label: 'Scam' },
  { value: 'underage', label: 'Underage User' },
  { value: 'other', label: 'Other' },
];

function ReportModal({ userId, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason) return toast.error('Please select a reason');
    setLoading(true);
    try {
      await api.post(`/blocks/${userId}/report`, { reason, description });
      toast.success('Report submitted. Our team will review it.');
      onClose();
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(200,150,45,0.3)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ color: '#f0c050', fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>Report Profile</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9a8f7e', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c8962d', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REPORT_REASONS.map(r => (
              <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 10, background: reason === r.value ? 'rgba(200,150,45,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${reason === r.value ? 'rgba(200,150,45,0.4)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s' }}>
                <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} style={{ accentColor: '#c8962d' }} />
                <span style={{ color: '#f5f0e8', fontSize: 14 }}>{r.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c8962d', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Additional Details (optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue..." rows={3}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,45,0.25)', borderRadius: 10, padding: '10px 12px', color: '#f5f0e8', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9a8f7e', padding: '11px', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ flex: 1, background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', color: '#fff', padding: '11px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileViewPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    profileAPI.getPublicProfile(userId)
      .then(({ data }) => setProfile(data.data.profile))
      .catch(console.error)
      .finally(() => setLoading(false));

    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userId]);

  const handleBlock = async () => {
    setMenuOpen(false);
    try {
      if (isBlocked) {
        await api.delete(`/blocks/${userId}`);
        setIsBlocked(false);
        toast.success('User unblocked');
      } else {
        await api.post(`/blocks/${userId}`);
        setIsBlocked(true);
        toast.success('User blocked. They will no longer appear in search.');
      }
    } catch { toast.error('Action failed'); }
  };

  const handleReport = () => { setMenuOpen(false); setShowReport(true); };

  const handleMessage = async () => {
    setStartingChat(true);
    try {
      const { data } = await api.post(`/chat/conversations/${userId}/start`);
      navigate(`/chat/${data.data.conversationId}`);
    } catch {
      toast.error('Could not start conversation');
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Loader2 size={40} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: '#9a8f7e' }}>Profile not found</div>;

  const Section = ({ title, icon: Icon, children }) => (
    <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(200,150,45,0.15)' }}>
        <Icon size={18} color="#c8962d" />
        <h3 style={{ color: '#f0c050', fontSize: 17, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>{children}</div>
    </div>
  );

  const Field = ({ label, value }) => value ? (
    <div>
      <div style={{ fontSize: 11, color: '#9a8f7e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>{label}</div>
      <div style={{ fontSize: 15, color: '#f5f0e8', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{String(value).replace(/_/g, ' ')}</div>
    </div>
  ) : null;

  const age = profile.dateOfBirth ? Math.floor((new Date() - new Date(profile.dateOfBirth)) / (365.25 * 24 * 3600 * 1000)) : null;
  const isOwnProfile = currentUser?.id === userId;

  // Inline button style — bypasses btn-interest class width issues
  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 10, border: 'none',
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@400;500;600&display=swap');`}</style>

      {showReport && <ReportModal userId={userId} onClose={() => setShowReport(false)} />}

      <Link to="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#c8962d', textDecoration: 'none', marginBottom: 24, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to Search
      </Link>

      {/* Profile Header */}
      <div style={{ background: 'linear-gradient(135deg,rgba(26,35,126,0.8),rgba(200,150,45,0.2))', border: '1px solid rgba(200,150,45,0.3)', borderRadius: 24, padding: 40, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 32, position: 'relative', flexWrap: 'wrap' }}>

        {/* 3-dot menu */}
        {!isOwnProfile && (
          <div ref={menuRef} style={{ position: 'absolute', top: 16, right: 16 }}>
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#9a8f7e', display: 'flex', alignItems: 'center' }}>
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: 40, right: 0, background: '#1a1a2e', border: '1px solid rgba(200,150,45,0.3)', borderRadius: 12, padding: 8, minWidth: 170, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <button onClick={handleBlock} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'none', border: 'none', color: isBlocked ? '#22c55e' : '#f59e0b', cursor: 'pointer', borderRadius: 8, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                  <Ban size={15} /> {isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button onClick={handleReport} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: 8, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                  <Flag size={15} /> Report Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Avatar */}
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(200,150,45,0.1)', border: '2px solid rgba(200,150,45,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {profile.personalDetails?.profilePictureUrl
            ? <img src={profile.personalDetails.profilePictureUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <User size={48} color="rgba(200,150,45,0.5)" />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#f5f0e8', fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>
            {profile.firstName} {profile.lastName?.[0]}.
          </h1>
          {age && <p style={{ color: '#c8962d', fontSize: 16, marginBottom: 8 }}>{age} years old</p>}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            {profile.familyDetails?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9a8f7e', fontSize: 14 }}><MapPin size={13} color="#c8962d" />{profile.familyDetails.city}</span>}
            {profile.employmentDetails?.jobRole && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9a8f7e', fontSize: 14 }}><Briefcase size={13} color="#c8962d" />{profile.employmentDetails.jobRole}</span>}
          </div>

          {/* Action buttons — both inline-flex, no class width interference */}
          {!isOwnProfile && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <InterestButton profileId={userId} />
              <button
                onClick={handleMessage}
                disabled={startingChat}
                style={{
                  ...btnBase,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(200,150,45,0.3)',
                  color: '#c8962d',
                  opacity: startingChat ? 0.7 : 1,
                  cursor: startingChat ? 'default' : 'pointer',
                }}
                onMouseEnter={e => { if (!startingChat) { e.currentTarget.style.background = 'rgba(200,150,45,0.15)'; e.currentTarget.style.borderColor = 'rgba(200,150,45,0.5)'; }}}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(200,150,45,0.3)'; }}
              >
                {startingChat ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageCircle size={15} />}
                {startingChat ? 'Opening...' : 'Message'}
              </button>
            </div>
          )}
        </div>
      </div>

      {profile.personalDetails && (
        <Section title="Personal Details" icon={User}>
          <Field label="Marital Status" value={profile.personalDetails.maritalStatus} />
          <Field label="Mother Tongue" value={profile.personalDetails.motherTongue} />
          {profile.personalDetails.height && <Field label="Height" value={`${profile.personalDetails.height} cm`} />}
          {profile.personalDetails.weight && <Field label="Weight" value={`${profile.personalDetails.weight} kg`} />}
          {profile.personalDetails.aboutMe && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 11, color: '#9a8f7e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>About</div><p style={{ color: '#f5f0e8', fontSize: 14, lineHeight: 1.6 }}>{profile.personalDetails.aboutMe}</p></div>}
        </Section>
      )}

      {profile.communityDetails && (
        <Section title="Community & Horoscope" icon={Star}>
          <Field label="Religion" value={profile.communityDetails.religion} />
          <Field label="Caste" value={profile.communityDetails.caste?.toUpperCase()} />
          <Field label="Sub Caste" value={profile.communityDetails.subCaste} />
          <Field label="Raasi" value={profile.communityDetails.raasi} />
          <Field label="Star" value={profile.communityDetails.star} />
        </Section>
      )}

      {profile.employmentDetails && (
        <Section title="Education & Career" icon={Briefcase}>
          <Field label="Education" value={profile.employmentDetails.highestEducation} />
          <Field label="Employment" value={profile.employmentDetails.employmentType} />
          <Field label="Job Role" value={profile.employmentDetails.jobRole} />
        </Section>
      )}
    </div>
  );
}
