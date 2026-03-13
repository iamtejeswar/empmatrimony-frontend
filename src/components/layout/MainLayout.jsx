// src/components/layout/MainLayout.jsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Heart, Search, Home, User, Shield, LogOut, Menu, X, Bell } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function MainLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Find Match' },
    { to: '/interests', icon: Heart, label: 'Interests' },
    ...(user?.role === 'admin' ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>
      {/* CSS Variables */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        :root {
          --gold: #c8962d;
          --gold-light: #f0c050;
          --navy: #1a237e;
          --navy-dark: #0d1257;
          --bg: #0f0f1a;
          --surface: #1a1a2e;
          --surface2: #16213e;
          --text: #f5f0e8;
          --text-muted: #9a8f7e;
          --border: rgba(200,150,45,0.2);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); }
        a { text-decoration: none; color: inherit; }
        .nav-link { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; transition: all 0.2s; color: var(--text-muted); font-family: Inter, sans-serif; font-size: 14px; font-weight: 500; }
        .nav-link:hover { background: rgba(200,150,45,0.1); color: var(--gold); }
        .nav-link.active { background: rgba(200,150,45,0.15); color: var(--gold); }
        .btn-gold { background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: #1a1a00; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; font-family: Inter, sans-serif; font-size: 14px; transition: all 0.2s; }
        .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(200,150,45,0.3); }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; }
        .btn-interest { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-family: Inter, sans-serif; font-size: 14px; transition: all 0.2s; }
        .btn-interest.send { background: linear-gradient(135deg, #c8962d, #f0c050); color: #1a1a00; }
        .btn-interest.send:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(200,150,45,0.3); }
        .btn-interest.pending { background: rgba(245,127,23,0.15); color: #f57f17; border: 1px solid rgba(245,127,23,0.3); }
        .btn-interest.accepted { background: rgba(76,175,80,0.15); color: #4caf50; border: 1px solid rgba(76,175,80,0.3); }
        .btn-interest.rejected { background: rgba(244,67,54,0.15); color: #f44336; border: 1px solid rgba(244,67,54,0.3); }
        .btn-interest.disabled { background: rgba(255,255,255,0.05); color: #666; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(15,15,26,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(200,150,45,0.2)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #c8962d, #f0c050)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={20} color="#1a1a00" fill="#1a1a00" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.5px' }}>Matrimony</div>
              <div style={{ fontSize: 11, color: '#9a8f7e', fontFamily: 'Inter, sans-serif', letterSpacing: '2px', textTransform: 'uppercase' }}>Platform</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`}>
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9a8f7e', padding: 8 }}>
              <Bell size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a237e, #c8962d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: '#fff',
              }}>
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
              <div style={{ display: 'none' }} className="user-info">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f0e8', fontFamily: 'Inter, sans-serif' }}>
                  Welcome, {user?.lastName}
                </div>
                <div style={{ fontSize: 11, color: '#9a8f7e', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>
                  {user?.role}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500, transition: 'all 0.2s',
            }}>
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
