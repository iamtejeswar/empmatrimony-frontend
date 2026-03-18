// src/pages/SearchPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { searchAPI } from '../services/api';
import { Search, Filter, User, MapPin, Briefcase, Star, ChevronLeft, ChevronRight, Loader2, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const iStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,45,0.25)', borderRadius: 8, padding: '10px 12px', color: '#f5f0e8', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' };
const lStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#c8962d', marginBottom: 5, letterSpacing: '0.5px', textTransform: 'uppercase' };
const PREMIUM_PLANS = ['basic', 'premium', 'gold'];

const scoreColor = (score) => {
  if (score >= 80) return { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e' };
  if (score >= 60) return { bg: 'rgba(200,150,45,0.15)', border: 'rgba(200,150,45,0.4)', text: '#f0c050' };
  if (score >= 40) return { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b' };
  return { bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.3)', text: '#9ca3af' };
};
const scoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Fair Match';
  return 'Low Match';
};

function FilterPanel({ filters, setFilters, onSearch, onClose }) {
  return (
    <div style={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="#c8962d" />
          <h3 style={{ color: '#f0c050', fontSize: 16, fontWeight: 700 }}>Filters</h3>
        </div>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9a8f7e', cursor: 'pointer', padding: 4 }}><X size={18} /></button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={lStyle}>Gender</label><select style={iStyle} value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})}><option value="">Any</option><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label style={lStyle}>Min Age</label><input type="number" style={iStyle} placeholder="21" value={filters.minAge} onChange={e => setFilters({...filters, minAge: e.target.value})} /></div>
        <div><label style={lStyle}>Max Age</label><input type="number" style={iStyle} placeholder="35" value={filters.maxAge} onChange={e => setFilters({...filters, maxAge: e.target.value})} /></div>
        <div><label style={lStyle}>Religion</label><select style={iStyle} value={filters.religion} onChange={e => setFilters({...filters, religion: e.target.value})}><option value="">Any</option>{['Hindu','Muslim','Christian','Sikh','Jain','Buddhist','Others'].map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}</select></div>
        <div><label style={lStyle}>Caste</label><select style={iStyle} value={filters.caste} onChange={e => setFilters({...filters, caste: e.target.value})}><option value="">Any</option>{['OC','BC','MBC','SC','ST'].map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}</select></div>
        <div><label style={lStyle}>Marital Status</label><select style={iStyle} value={filters.maritalStatus} onChange={e => setFilters({...filters, maritalStatus: e.target.value})}><option value="">Any</option><option value="never_married">Never Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option></select></div>
        <div><label style={lStyle}>Employment</label><select style={iStyle} value={filters.employmentType} onChange={e => setFilters({...filters, employmentType: e.target.value})}><option value="">Any</option><option value="state_government">State Govt</option><option value="central_government">Central Govt</option><option value="psu">PSU</option><option value="banking">Banking</option><option value="private">Private</option><option value="self_employed">Self Employed</option></select></div>
        <div><label style={lStyle}>City</label><input style={iStyle} placeholder="Chennai, Mumbai..." value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} /></div>
        <div><label style={lStyle}>State</label><input style={iStyle} placeholder="Tamil Nadu..." value={filters.state} onChange={e => setFilters({...filters, state: e.target.value})} /></div>
        <button onClick={() => { onSearch(); onClose?.(); }} style={{ width: '100%', background: 'linear-gradient(135deg,#c8962d,#f0c050)', border: 'none', color: '#1a1a00', padding: '12px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Search size={15} /> Search
        </button>
        <button onClick={() => setFilters({ gender:'',minAge:'',maxAge:'',religion:'',caste:'',maritalStatus:'',employmentType:'',city:'',state:'' })} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9a8f7e', padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>
          Clear Filters
        </button>
      </div>
    </div>
  );
}

function ProfileCard({ profile, isPremium }) {
  return (
    <Link to={`/profile/${profile.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(200,150,45,0.5)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(200,150,45,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Photo */}
        <div style={{ height: 180, background: 'linear-gradient(135deg,#1a1a2e,#0d1257)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {profile.personalDetails?.profilePictureUrl ? (
            <img src={profile.personalDetails.profilePictureUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(200,150,45,0.3),rgba(200,150,45,0.1))', border: '2px solid rgba(200,150,45,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={32} color="rgba(200,150,45,0.5)" />
            </div>
          )}
          {/* Gender badge */}
          <div style={{ position: 'absolute', top: 10, left: 10, background: profile.gender === 'female' ? 'rgba(236,72,153,0.85)' : 'rgba(59,130,246,0.85)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
            {profile.gender === 'female' ? '♀ Bride' : '♂ Groom'}
          </div>
          {/* Match score */}
          {profile.matchScore > 0 && (
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              {(() => { const c = scoreColor(profile.matchScore); return (
                <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '5px 8px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c.text, lineHeight: 1, fontFamily: "'Cormorant Garamond', serif" }}>{profile.matchScore}%</div>
                  <div style={{ fontSize: 9, color: c.text, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{scoreLabel(profile.matchScore)}</div>
                </div>
              );})()}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: 16 }}>
          {/* Name + Age — always visible */}
          <div style={{ marginBottom: 10 }}>
            <h3 style={{ color: '#f5f0e8', fontSize: 16, fontWeight: 700, marginBottom: 2, fontFamily: "'Cormorant Garamond', serif" }}>
              {profile.firstName} {profile.lastName?.[0]}.
            </h3>
            <p style={{ color: '#c8962d', fontSize: 13, fontWeight: 500 }}>
              {profile.age ? `${profile.age} yrs` : 'Age N/A'}
              {profile.personalDetails?.height ? ` · ${profile.personalDetails.height} cm` : ''}
            </p>
          </div>

          {/* Details — always shown on card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
            {profile.employmentDetails?.jobRole && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a8f7e', fontSize: 12 }}>
                <Briefcase size={11} color="#c8962d" />
                {profile.employmentDetails.jobRole}
                {profile.employmentDetails?.highestEducation ? ` · ${profile.employmentDetails.highestEducation}` : ''}
              </div>
            )}
            {profile.familyDetails?.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a8f7e', fontSize: 12 }}>
                <MapPin size={11} color="#c8962d" />
                {profile.familyDetails.city}{profile.familyDetails.state ? `, ${profile.familyDetails.state}` : ''}
              </div>
            )}
            {profile.communityDetails?.religion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a8f7e', fontSize: 12 }}>
                <Star size={11} color="#c8962d" />
                {profile.communityDetails.religion.charAt(0).toUpperCase() + profile.communityDetails.religion.slice(1)}
                {profile.communityDetails.caste ? ` · ${profile.communityDetails.caste.toUpperCase()}` : ''}
              </div>
            )}
          </div>

          {/* Match bar */}
          {profile.matchScore > 0 && (
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ height: '100%', width: `${profile.matchScore}%`, background: profile.matchScore >= 80 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : profile.matchScore >= 60 ? 'linear-gradient(90deg,#c8962d,#f0c050)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: 3 }} />
            </div>
          )}

          {/* CTA */}
          <div style={{ padding: '8px 12px', background: isPremium ? 'rgba(200,150,45,0.08)' : 'rgba(255,255,255,0.04)', borderRadius: 8, textAlign: 'center', fontSize: 12, color: isPremium ? '#c8962d' : '#9a8f7e', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {isPremium ? 'View Full Profile →' : <><Lock size={11} /> Upgrade to View Full Profile</>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const { user } = useSelector((s) => s.auth);
  const isPremium = user?.role === 'admin' || user?.role === 'moderator' || PREMIUM_PLANS.includes(user?.subscriptionPlan);

  const [filters, setFilters] = useState({ gender:'',minAge:'',maxAge:'',religion:'',caste:'',maritalStatus:'',employmentType:'',city:'',state:'' });
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    doSearch(1);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const doSearch = async (page = 1) => {
    setLoading(true);
    setSearched(true);
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await searchAPI.search({ ...cleanFilters, page, limit: 12 });
      setResults(data.data.profiles);
      setPagination(data.data.pagination);
    } catch { toast.error('Search failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .search-grid { grid-template-columns: 1fr !important; }
          .filter-sidebar { display: none !important; }
          .filter-sidebar.mobile-open { display: block !important; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 200; overflow-y: auto; padding: 16px; background: rgba(15,15,26,0.98); }
          .profile-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; gap: 12px !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>Find Your Match</h1>
          <p style={{ color: '#9a8f7e', fontSize: 13 }}>Profiles sorted by compatibility score</p>
        </div>
        {isMobile && (
          <button onClick={() => setShowMobileFilters(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(200,150,45,0.15)', border: '1px solid rgba(200,150,45,0.3)', color: '#c8962d', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <Filter size={15} /> Filters
          </button>
        )}
      </div>

      {showMobileFilters && (
        <div className="filter-sidebar mobile-open">
          <FilterPanel filters={filters} setFilters={setFilters} onSearch={() => doSearch(1)} onClose={() => setShowMobileFilters(false)} />
        </div>
      )}

      <div className="search-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
        <div className="filter-sidebar" style={{ display: isMobile ? 'none' : 'block' }}>
          <FilterPanel filters={filters} setFilters={setFilters} onSearch={() => doSearch(1)} />
        </div>

        <div>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <Loader2 size={40} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {!loading && searched && (
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ color: '#9a8f7e', fontSize: 13 }}>
                  Found <span style={{ color: '#f0c050', fontWeight: 700 }}>{pagination.total}</span> profiles
                </span>
                <span style={{ fontSize: 12, color: '#9a8f7e' }}>Sorted by match score ↓</span>
              </div>

              {results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, background: 'rgba(26,26,46,0.5)', borderRadius: 20, border: '1px solid rgba(200,150,45,0.15)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>💍</div>
                  <h3 style={{ color: '#f5f0e8', fontSize: 20, marginBottom: 8 }}>No profiles found</h3>
                  <p style={{ color: '#9a8f7e' }}>Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
                    {results.map(profile => <ProfileCard key={profile.id} profile={profile} isPremium={isPremium} />)}
                  </div>
                  {pagination.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32 }}>
                      <button onClick={() => doSearch(pagination.page - 1)} disabled={pagination.page === 1} style={{ background: 'rgba(200,150,45,0.1)', border: '1px solid rgba(200,150,45,0.3)', color: '#c8962d', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', opacity: pagination.page === 1 ? 0.4 : 1 }}>
                        <ChevronLeft size={16} />
                      </button>
                      <span style={{ color: '#9a8f7e', fontSize: 14 }}>Page {pagination.page} of {pagination.totalPages}</span>
                      <button onClick={() => doSearch(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} style={{ background: 'rgba(200,150,45,0.1)', border: '1px solid rgba(200,150,45,0.3)', color: '#c8962d', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', opacity: pagination.page === pagination.totalPages ? 0.4 : 1 }}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
