// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, UserCheck, UserX, Clock, BarChart3, Search, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#9a8f7e', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <p style={{ color: '#f5f0e8', fontSize: 32, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{value ?? '—'}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers({ limit: 20 }),
      ]);
      setStats(statsRes.data.data.stats);
      setUsers(usersRes.data.data.users);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, status) => {
    setActionLoading((p) => ({ ...p, [userId]: true }));
    try {
      await adminAPI.updateUserStatus(userId, status);
      toast.success(`User ${status}`);
      fetchData();
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || u.accountStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Loader2 size={40} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1280, margin: '0 auto', padding: 32 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@300;400;500;600&display=swap');`}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", marginBottom: 6 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#9a8f7e' }}>Manage users, approvals, and platform activity</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Users} label="Total Users" value={stats?.total} color="#60a5fa" />
        <StatCard icon={Clock} label="Pending" value={stats?.pending} color="#f59e0b" />
        <StatCard icon={UserCheck} label="Active" value={stats?.active} color="#22c55e" />
        <StatCard icon={AlertCircle} label="Suspended" value={stats?.suspended} color="#f97316" />
        <StatCard icon={UserX} label="Blocked" value={stats?.blocked} color="#ef4444" />
      </div>

      {/* User Management */}
      <div style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(200,150,45,0.2)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(200,150,45,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ color: '#f5f0e8', fontSize: 18, fontWeight: 700 }}>User Management</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9a8f7e' }} />
              <input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,45,0.25)', borderRadius: 8, padding: '8px 12px 8px 30px', color: '#f5f0e8', fontSize: 13, outline: 'none', width: 200 }}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,45,0.25)', borderRadius: 8, padding: '8px 12px', color: '#f5f0e8', fontSize: 13, outline: 'none' }}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(200,150,45,0.08)' }}>
                {['Name', 'Email', 'Gender', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#c8962d', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const statusColors = { pending: '#f59e0b', active: '#22c55e', suspended: '#f97316', blocked: '#ef4444' };
                const color = statusColors[user.accountStatus] || '#9a8f7e';
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', color: '#f5f0e8', fontSize: 14, fontWeight: 500 }}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9a8f7e', fontSize: 13 }}>{user.email}</td>
                    <td style={{ padding: '14px 16px', color: '#9a8f7e', fontSize: 13, textTransform: 'capitalize' }}>{user.gender || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: `${color}20`, border: `1px solid ${color}40`,
                        color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                      }}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9a8f7e', fontSize: 13 }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {user.accountStatus !== 'active' && (
                          <button onClick={() => handleStatusUpdate(user.id, 'active')} disabled={actionLoading[user.id]} title="Approve" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={12} /> Approve
                          </button>
                        )}
                        {user.accountStatus !== 'suspended' && (
                          <button onClick={() => handleStatusUpdate(user.id, 'suspended')} disabled={actionLoading[user.id]} title="Suspend" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', color: '#f97316', padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={12} /> Suspend
                          </button>
                        )}
                        {user.accountStatus !== 'blocked' && (
                          <button onClick={() => handleStatusUpdate(user.id, 'blocked')} disabled={actionLoading[user.id]} title="Block" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <XCircle size={12} /> Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9a8f7e' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
