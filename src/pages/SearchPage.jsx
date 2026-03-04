// src/pages/SearchPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchAPI } from '../services/api';
import { Search, Filter, User, MapPin, Briefcase, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const iStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,45,0.25)', borderRadius: 8, padding: '10px 12px', color: '#f5f0e8', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' };
const lStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#c8962d', marginBottom: 5, letterSpacing: '0.5px', textTransform: 'uppercase' };

function FilterPanel({ filters, setFilters, onSearch }) {
  return (
    <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Filter size={16} color="#c8962d" />
        <h3 style={{ color: '#f0c050', fontSize: 16, fontWeight: 700 }}>Filters</h3>
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
        <button onClick={onSearch} style={{ width: '100%', background: 'linear-gradient(135deg,#c8962d,#f0c050)', border: 'none', color: '#1a1a00', padding: '12px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Search size={15} /> Search
        </button>
        <button onClick={() => setFilters({ gender:'',minAge:'',maxAge:'',religion:'',caste:'',maritalStatus:'',employmentType:'',city:'',state:'' })} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9a8f7e', padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>
          Clear Filters
        </button>
      </div>
    </div>
  );
}

function ProfileCard({ profile }) {
  return (
    <Link to={`/profile/${profile.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16,
        overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(200,150,45,0.5)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(200,150,45,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Photo placeholder (masked) */}
        <div style={{
          height: 200, background: 'linear-gradient(135deg, #1a1a2e, #0d1257)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg,rgba(200,150,45,0.3),rgba(200,150,45,0.1))',
              border: '2px solid rgba(200,150,45,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              backdropFilter: 'blur(4px)',
            }}>
              <User size={36} color="rgba(200,150,45,0.5)" />
            </div>
            <div style={{ fontSize: 11, color: '#9a8f7e', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 20 }}>
              🔒 Photo visible to premium members
            </div>
          </div>
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: profile.gender === 'female' ? 'rgba(236,72,153,0.2)' : 'rgba(59,130,246,0.2)',
            border: `1px solid ${profile.gender === 'female' ? 'rgba(236,72,153,0.4)' : 'rgba(59,130,246,0.4)'}`,
            color: profile.gender === 'female' ? '#f472b6' : '#60a5fa',
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          }}>
            {profile.gender === 'female' ? '♀ Bride' : '♂ Groom'}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h3 style={{ color: '#f5f0e8', fontSize: 17, fontWeight: 700, marginBottom: 2, fontFamily: "'Cormorant Garamond', serif" }}>
                {profile.firstName} {profile.lastName[0]}.
              </h3>
              <p style={{ color: '#c8962d', fontSize: 13, fontWeight: 500 }}>
                {profile.age ? `${profile.age} yrs` : 'Age N/A'}
              </p>
            </div>
            {profile.communityDetails?.raasi && (
              <div style={{ background: 'rgba(200,150,45,0.1)', border: '1px solid rgba(200,150,45,0.3)', padding: '4px 10px', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#9a8f7e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Raasi</div>
                <div style={{ fontSize: 12, color: '#f0c050', fontWeight: 600 }}>{profile.communityDetails.raasi}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profile.familyDetails?.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a8f7e', fontSize: 13 }}>
                <MapPin size={12} color="#c8962d" />
                {profile.familyDetails.city}{profile.familyDetails.state ? `, ${profile.familyDetails.state}` : ''}
              </div>
            )}
            {profile.employmentDetails?.jobRole && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a8f7e', fontSize: 13 }}>
                <Briefcase size={12} color="#c8962d" />
                {profile.employmentDetails.jobRole}
              </div>
            )}
            {profile.communityDetails?.religion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a8f7e', fontSize: 13 }}>
                <Star size={12} color="#c8962d" />
                {profile.communityDetails.religion.charAt(0).toUpperCase() + profile.communityDetails.religion.slice(1)}
                {profile.communityDetails.caste ? ` · ${profile.communityDetails.caste.toUpperCase()}` : ''}
              </div>
            )}
            {profile.personalDetails?.maritalStatus && (
              <div style={{ fontSize: 12, color: '#9a8f7e', textTransform: 'capitalize' }}>
                {profile.personalDetails.maritalStatus.replace(/_/g, ' ')}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(200,150,45,0.08)', borderRadius: 10, textAlign: 'center', fontSize: 13, color: '#c8962d', fontWeight: 500 }}>
            View Full Profile →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [filters, setFilters] = useState({ gender:'',minAge:'',maxAge:'',religion:'',caste:'',maritalStatus:'',employmentType:'',city:'',state:'' });
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (page = 1) => {
    setLoading(true);
    setSearched(true);
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await searchAPI.search({ ...cleanFilters, page, limit: 12 });
      setResults(data.data.profiles);
      setPagination(data.data.pagination);
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", marginBottom: 6 }}>
          Find Your Match
        </h1>
        <p style={{ color: '#9a8f7e' }}>Search from thousands of verified profiles</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Filter Sidebar */}
        <FilterPanel filters={filters} setFilters={setFilters} onSearch={() => doSearch(1)} />

        {/* Results */}
        <div>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <Loader2 size={40} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!loading && searched && (
            <div>
              <div style={{ marginBottom: 20, color: '#9a8f7e', fontSize: 14 }}>
                Found <span style={{ color: '#f0c050', fontWeight: 700 }}>{pagination.total}</span> matching profiles
              </div>

              {results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, background: 'rgba(26,26,46,0.5)', borderRadius: 20, border: '1px solid rgba(200,150,45,0.15)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>💍</div>
                  <h3 style={{ color: '#f5f0e8', fontSize: 20, marginBottom: 8 }}>No profiles found</h3>
                  <p style={{ color: '#9a8f7e' }}>Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                    {results.map((profile) => <ProfileCard key={profile.id} profile={profile} />)}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32 }}>
                      <button onClick={() => doSearch(pagination.page - 1)} disabled={pagination.page === 1} style={{ background: 'rgba(200,150,45,0.1)', border: '1px solid rgba(200,150,45,0.3)', color: '#c8962d', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ChevronLeft size={16} />
                      </button>
                      <span style={{ color: '#9a8f7e', fontSize: 14 }}>
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button onClick={() => doSearch(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} style={{ background: 'rgba(200,150,45,0.1)', border: '1px solid rgba(200,150,45,0.3)', color: '#c8962d', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!searched && !loading && (
            <div style={{ textAlign: 'center', padding: 80, background: 'rgba(26,26,46,0.5)', borderRadius: 20, border: '1px solid rgba(200,150,45,0.15)' }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
              <h3 style={{ color: '#f5f0e8', fontSize: 22, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Start Your Search</h3>
              <p style={{ color: '#9a8f7e' }}>Use the filters on the left to find your ideal match</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
