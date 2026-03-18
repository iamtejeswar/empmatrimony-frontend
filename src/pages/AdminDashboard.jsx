// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import api from '../services/api';
import {
  Users, UserCheck, UserX, Clock, Search, CheckCircle, XCircle,
  AlertCircle, Loader2, Flag, Heart, Eye, BarChart3, Shield,
  MessageCircle, Ban
} from 'lucide-react';
import toast from 'react-hot-toast';

const iStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,45,0.25)', borderRadius: 8, padding: '8px 12px', color: '#f5f0e8', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' };

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ color: '#9a8f7e', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <p style={{ color: '#f5f0e8', fontSize: 32, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{value ?? '—'}</p>
      {sub && <p style={{ color: '#9a8f7e', fontSize: 12, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function TabButton({ label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(200,150,45,0.15)' : 'transparent',
      border: active ? '1px solid rgba(200,150,45,0.4)' : '1px solid transparent',
      color: active ? '#f0c050' : '#9a8f7e', padding: '8px 18px', borderRadius: 10,
      cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', position: 'relative',
    }}>
      {label}
      {badge > 0 && (
        <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11, fontWeight: 700 }}>{badge}</span>
      )}
    </button>
  );
}

// ── OVERVIEW TAB ──────────────────────────────────────────
function OverviewTab({ stats }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Users} label="Total Users" value={stats?.total} color="#60a5fa" />
        <StatCard icon={Clock} label="Pending Approval" value={stats?.pending} color="#f59e0b" />
        <StatCard icon={UserCheck} label="Active" value={stats?.active} color="#22c55e" />
        <StatCard icon={AlertCircle} label="Suspended" value={stats?.suspended} color="#f97316" />
        <StatCard icon={UserX} label="Blocked" value={stats?.blocked} color="#ef4444" />
        <StatCard icon={UserCheck} label="Complete Profiles" value={stats?.profileComplete} color="#a78bfa" />
        <StatCard icon={Heart} label="Interests Sent" value={stats?.totalInterests} color="#f472b6" />
        <StatCard icon={MessageCircle} label="Messages" value={stats?.totalMessages} color="#34d399" />
        <StatCard icon={Flag} label="Pending Reports" value={stats?.pendingReports} color="#fb923c" />
      </div>

      {/* Gender split */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: '#f0c050', fontSize: 16, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", marginBottom: 16 }}>Gender Distribution</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Male', value: stats.male, color: '#60a5fa' },
                { label: 'Female', value: stats.female, color: '#f472b6' },
              ].map(g => {
                const pct = stats.total ? Math.round((g.value / stats.total) * 100) : 0;
                return (
                  <div key={g.label} style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#9a8f7e', fontSize: 13 }}>{g.label}</span>
                      <span style={{ color: g.color, fontSize: 13, fontWeight: 600 }}>{g.value} ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: '#f0c050', fontSize: 16, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", marginBottom: 16 }}>Account Status</h3>
            {[
              { label: 'Active', value: stats.active, color: '#22c55e' },
              { label: 'Pending', value: stats.pending, color: '#f59e0b' },
              { label: 'Suspended', value: stats.suspended, color: '#f97316' },
              { label: 'Blocked', value: stats.blocked, color: '#ef4444' },
            ].map(s => {
              const pct = stats.total ? Math.round((s.value / stats.total) * 100) : 0;
              return (
                <div key={s.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#9a8f7e', fontSize: 12 }}>{s.label}</span>
                    <span style={{ color: s.color, fontSize: 12, fontWeight: 600 }}>{s.value}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── USERS TAB ─────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchUsers(); }, [page, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 15, status: statusFilter || undefined });
      setUsers(data.data.users);
      setTotal(data.data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleStatus = async (userId, status) => {
    setActionLoading(p => ({ ...p, [userId]: true }));
    try {
      await adminAPI.updateUserStatus(userId, status);
      toast.success(`User ${status}`);
      fetchUsers();
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(p => ({ ...p, [userId]: false })); }
  };

  const filtered = users.filter(u => !search ||
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = { pending: '#f59e0b', active: '#22c55e', suspended: '#f97316', blocked: '#ef4444' };

  return (
    <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(200,150,45,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#f5f0e8', fontSize: 18, fontWeight: 700 }}>User Management</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9a8f7e' }} />
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...iStyle, paddingLeft: 30, width: 180 }} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={iStyle}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={28} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(200,150,45,0.08)' }}>
                {['Name', 'Email', 'Gender', 'Role', 'Profile', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#c8962d', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const color = statusColors[user.accountStatus] || '#9a8f7e';
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', color: '#f5f0e8', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9a8f7e', fontSize: 13 }}>{user.email}</td>
                    <td style={{ padding: '12px 16px', color: '#9a8f7e', fontSize: 13, textTransform: 'capitalize' }}>{user.gender || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: user.role === 'admin' ? '#f0c050' : '#9a8f7e', fontSize: 12, textTransform: 'capitalize' }}>{user.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: user.isProfileComplete ? '#22c55e' : '#f59e0b', fontSize: 12 }}>
                        {user.isProfileComplete ? '✓ Complete' : '○ Incomplete'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: `${color}20`, border: `1px solid ${color}40`, color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9a8f7e', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {user.accountStatus !== 'active' && (
                          <button onClick={() => handleStatus(user.id, 'active')} disabled={actionLoading[user.id]}
                            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <CheckCircle size={11} /> Approve
                          </button>
                        )}
                        {user.accountStatus !== 'suspended' && user.role !== 'admin' && (
                          <button onClick={() => handleStatus(user.id, 'suspended')} disabled={actionLoading[user.id]}
                            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', color: '#f97316', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <AlertCircle size={11} /> Suspend
                          </button>
                        )}
                        {user.accountStatus !== 'blocked' && user.role !== 'admin' && (
                          <button onClick={() => handleStatus(user.id, 'blocked')} disabled={actionLoading[user.id]}
                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <XCircle size={11} /> Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9a8f7e' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(200,150,45,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9a8f7e', fontSize: 13 }}>Showing {users.length} of {total}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ ...iStyle, padding: '6px 14px', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={users.length < 15}
              style={{ ...iStyle, padding: '6px 14px', cursor: 'pointer', opacity: users.length < 15 ? 0.4 : 1 }}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── REPORTS TAB ───────────────────────────────────────────
function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reports?status=pending&limit=50');
      setReports(data.data.reports || []);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  const handleReport = async (reportId, status, userId = null, userAction = null) => {
    setActionLoading(p => ({ ...p, [reportId]: true }));
    try {
      await api.patch(`/admin/reports/${reportId}`, { status });
      if (userId && userAction) {
        await adminAPI.updateUserStatus(userId, userAction);
      }
      toast.success(`Report ${status}`);
      fetchReports();
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(p => ({ ...p, [reportId]: false })); }
  };

  const reasonLabels = {
    fake_profile: 'Fake Profile', inappropriate_content: 'Inappropriate Content',
    harassment: 'Harassment', spam: 'Spam', scam: 'Scam', underage: 'Underage', other: 'Other',
  };

  return (
    <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(200,150,45,0.15)' }}>
        <h2 style={{ color: '#f5f0e8', fontSize: 18, fontWeight: 700 }}>Reports Queue</h2>
        <p style={{ color: '#9a8f7e', fontSize: 13, marginTop: 4 }}>{reports.length} pending reports</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={28} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9a8f7e' }}>
          <Shield size={40} color="rgba(200,150,45,0.3)" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p>No pending reports 🎉</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {reports.map(report => (
            <div key={report.id} style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {reasonLabels[report.reason] || report.reason}
                    </span>
                    <span style={{ color: '#9a8f7e', fontSize: 12 }}>
                      {new Date(report.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p style={{ color: '#f5f0e8', fontSize: 14, marginBottom: 4 }}>
                    <span style={{ color: '#9a8f7e' }}>Reported:</span> {report.reported_first_name} {report.reported_last_name} · {report.reported_email}
                  </p>
                  <p style={{ color: '#9a8f7e', fontSize: 13, marginBottom: 4 }}>
                    <span>By:</span> {report.reporter_first_name} {report.reporter_last_name}
                  </p>
                  {report.description && (
                    <p style={{ color: '#9a8f7e', fontSize: 13, fontStyle: 'italic', marginTop: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: '3px solid rgba(200,150,45,0.3)' }}>
                      "{report.description}"
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleReport(report.id, 'dismissed')} disabled={actionLoading[report.id]}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9a8f7e', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                    Dismiss
                  </button>
                  <button onClick={() => handleReport(report.id, 'reviewed', report.reported_id, 'suspended')} disabled={actionLoading[report.id]}
                    style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', color: '#f97316', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                    Suspend User
                  </button>
                  <button onClick={() => handleReport(report.id, 'reviewed', report.reported_id, 'blocked')} disabled={actionLoading[report.id]}
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                    Block User
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        adminAPI.getDashboard(),
        api.get('/admin/reports?status=pending&limit=1'),
      ]);
      const s = statsRes.data.data.stats;
      setStats(s);
      setPendingReports(reportsRes.data.data.total || 0);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Loader2 size={40} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@300;400;500;600&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#9a8f7e' }}>Manage users, reports, and platform activity</p>
        </div>
        <button onClick={fetchStats} style={{ background: 'rgba(200,150,45,0.1)', border: '1px solid rgba(200,150,45,0.3)', color: '#c8962d', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <TabButton label="Overview" active={tab === 'overview'} onClick={() => setTab('overview')} />
        <TabButton label="Users" active={tab === 'users'} onClick={() => setTab('users')} />
        <TabButton label="Reports" active={tab === 'reports'} onClick={() => setTab('reports')} badge={pendingReports} />
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab stats={stats} />}
      {tab === 'users' && <UsersTab />}
      {tab === 'reports' && <ReportsTab />}
    </div>
  );
}
