// src/pages/ProfileViewPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileAPI } from '../services/api';
import { ArrowLeft, User, MapPin, Briefcase, Star, Users, Loader2 } from 'lucide-react';

export default function ProfileViewPage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileAPI.getPublicProfile(userId)
      .then(({ data }) => setProfile(data.data.profile))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Loader2 size={40} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
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

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@400;500;600&display=swap');`}</style>
      <Link to="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#c8962d', textDecoration: 'none', marginBottom: 24, fontSize: 14 }}><ArrowLeft size={16} /> Back to Search</Link>

      {/* Profile Header */}
      <div style={{ background: 'linear-gradient(135deg,rgba(26,35,126,0.8),rgba(200,150,45,0.2))', border: '1px solid rgba(200,150,45,0.3)', borderRadius: 24, padding: 40, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(200,150,45,0.1)', border: '2px solid rgba(200,150,45,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={48} color="rgba(200,150,45,0.5)" />
        </div>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#f5f0e8', fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>
            {profile.firstName} {profile.lastName?.[0]}.
          </h1>
          {age && <p style={{ color: '#c8962d', fontSize: 16, marginBottom: 8 }}>{age} years old</p>}
          <div style={{ display: 'flex', gap: 20 }}>
            {profile.familyDetails?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9a8f7e', fontSize: 14 }}><MapPin size={13} color="#c8962d" />{profile.familyDetails.city}</span>}
            {profile.employmentDetails?.jobRole && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9a8f7e', fontSize: 14 }}><Briefcase size={13} color="#c8962d" />{profile.employmentDetails.jobRole}</span>}
          </div>
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

      {/* Premium CTA */}
      <div style={{ background: 'linear-gradient(135deg,rgba(200,150,45,0.15),rgba(200,150,45,0.05))', border: '1px solid rgba(200,150,45,0.4)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 24, marginBottom: 8 }}>👑</p>
        <h3 style={{ color: '#f0c050', fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", marginBottom: 8 }}>Upgrade to Premium</h3>
        <p style={{ color: '#9a8f7e', fontSize: 14, marginBottom: 20 }}>View photos, contact details, and send interests</p>
        <button style={{ background: 'linear-gradient(135deg,#c8962d,#f0c050)', border: 'none', color: '#1a1a00', padding: '12px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
