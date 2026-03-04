// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@400;600&display=swap');`}</style>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#c8962d,#f0c050)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Heart size={28} color="#1a1a00" fill="#1a1a00" />
      </div>
      <h1 style={{ fontSize: 80, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", marginBottom: 0 }}>404</h1>
      <h2 style={{ fontSize: 24, color: '#f5f0e8', marginBottom: 8 }}>Page Not Found</h2>
      <p style={{ color: '#9a8f7e', marginBottom: 32 }}>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#c8962d,#f0c050)', color: '#1a1a00', padding: '12px 24px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>
        <Home size={16} /> Go Home
      </Link>
    </div>
  );
}
