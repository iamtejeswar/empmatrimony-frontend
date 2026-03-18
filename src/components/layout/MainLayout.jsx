// src/components/layout/MainLayout.jsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Heart, Search, Home, Shield, LogOut, Menu, X, Bell, Eye, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function MainLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/chat/unread-count');
        setUnreadCount(data.data.unreadCount);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Find Match' },
    { to: '/interests', icon: Heart, label: 'Interests' },
    { to: '/chat', icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { to: '/who-viewed-me', icon: Eye, label: 'Who Viewed Me' },
    ...(user?.role === 'admin' ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        :root {
          --gold: #c8962d; --gold-light: #f0c050; --navy: #1a237e; --navy-dark: #0d1257;
          --bg: #0f0f1a; --surface: #1a1a2e; --surface2: #16213e;
          --text: #f5f0e8; --text-muted: #9a8f7e; --border: rgba(200,150,45,0.2);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); }
        a { text-decoration: none; color: inherit; }
        .nav-link { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; transition: all 0.2s; color: var(--text-muted); font-family: Inter, sans-serif; font-size: 14px; font-weight: 500; position: relative; }
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
        .nav-badge { position: absolute; top: 6px; right: 8px; background: #ef4444; color: #fff; border-radius: 50%; width: 16px; height: 16px; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; }
        .mobile-drawer { display: none; }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-drawer.open { display: flex; flex-direction: column; position: fixed; top: 72px; left: 0; right: 0; bottom: 0; background: rgba(15,15,26,0.98); z-index: 99; padding: 24px; gap: 8px; overflow-y: auto; }
          .sign-out-text { display: none !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,150,45,0.2)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #c8962d, #f0c050)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={20} color="#1a1a00" fill="#1a1a00" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.5px' }}>Matrimony</div>
              <div style={{ fontSize: 11, color: '#9a8f7e', fontFamily: 'Inter, sans-serif', letterSpacing: '2px', textTransform: 'uppercase' }}>Platform</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {navLinks.map(({ to, icon: Icon, label, badge }) => (
              <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`}>
                <Icon size={16} />
                {label}
                {badge > 0 && <span className="nav-badge">{badge > 9 ? '9+' : badge}</span>}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9a8f7e', padding: 8 }}>
              <Bell size={20} />
            </button>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #1a237e, #c8962d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.firstName?.[0]?.toUpperCase()}
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              <LogOut size={15} />
              <span className="sign-out-text">Sign Out</span>
            </button>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9a8f7e', padding: 8 }}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map(({ to, icon: Icon, label, badge }) => (
          <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`} style={{ fontSize: 16, padding: '14px 16px' }} onClick={() => setMobileOpen(false)}>
            <Icon size={18} />
            {label}
            {badge > 0 && <span className="nav-badge">{badge > 9 ? '9+' : badge}</span>}
          </Link>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(200,150,45,0.15)' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
