import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

export default function GoogleSuccessPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const user = JSON.parse(decodeURIComponent(params.get('user')));

    if (accessToken && user) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch(setCredentials({ accessToken, refreshToken, user }));
      navigate(user.isProfileComplete ? '/dashboard' : '/profile/complete', { replace: true });
    } else {
      navigate('/login', { replace: true });
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