import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoogleSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const user = JSON.parse(decodeURIComponent(params.get('user')));

    if (accessToken && user) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = user.isProfileComplete ? '/dashboard' : '/profile/complete';
    } else {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0f1a', color: '#f5f0e8', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💍</div>
        <p style={{ fontSize: 18, color: '#c8962d' }}>Signing you in with Google...</p>
      </div>
    </div>
  );
}