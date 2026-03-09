// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, verifyOTP, loginWithOTP, googleAuth, clearError, clearOTPState } from '../store/authSlice';
import { Heart, Mail, Key, ArrowRight, Loader2, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent, otpVerified, user, isAuthenticated, redirectTo, welcomeMessage } = useSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // email | otp

  useEffect(() => {
    if (isAuthenticated && user) {
      if (welcomeMessage) toast.success(welcomeMessage);
      navigate(redirectTo || (user.isProfileComplete ? '/dashboard' : '/profile/complete'));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error]);

  useEffect(() => {
    if (otpSent && step === 'email') {
      setStep('otp');
      toast.success('OTP sent to your email!');
    }
  }, [otpSent]);

  useEffect(() => {
    if (otpVerified && step === 'otp') {
      dispatch(loginWithOTP(email));
    }
  }, [otpVerified]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    dispatch(sendOTP({ email, purpose: 'login' }));
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP');
    dispatch(verifyOTP({ email, otp }));
  };

 const handleGoogleLogin = () => {
    window.location.href = 'https://empmatrimony-backend-production.up.railway.app/api/v1/auth/google';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0d1257 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
        .auth-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(200,150,45,0.3); border-radius: 12px; padding: 14px 16px; color: #f5f0e8; font-size: 15px; font-family: Inter, sans-serif; outline: none; transition: all 0.2s; }
        .auth-input:focus { border-color: #c8962d; background: rgba(200,150,45,0.08); box-shadow: 0 0 0 3px rgba(200,150,45,0.1); }
        .auth-input::placeholder { color: #5a5050; }
        .otp-input { letter-spacing: 12px; text-align: center; font-size: 24px; font-weight: 700; }
        .btn-primary { width: 100%; background: linear-gradient(135deg, #c8962d, #f0c050); color: #1a1a00; border: none; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(200,150,45,0.4); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-google { width: 100%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); color: #f5f0e8; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; }
        .btn-google:hover { background: rgba(255,255,255,0.12); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
      `}</style>

      {/* Background decorations */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${[300,200,150,250,180][i]}px`,
          height: `${[300,200,150,250,180][i]}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(200,150,45,${[0.05,0.08,0.04,0.06,0.07][i]}), transparent)`,
          top: `${[10,60,30,80,5][i]}%`,
          left: `${[5,70,20,85,45][i]}%`,
          animation: `float ${[6,8,7,9,5][i]}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
          pointerEvents: 'none',
        }} />
      ))}

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #c8962d, #f0c050)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(200,150,45,0.4)',
          }}>
            <Heart size={32} color="#1a1a00" fill="#1a1a00" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", marginBottom: 8 }}>
            MatrimonyPlatform
          </h1>
          <p style={{ color: '#9a8f7e', fontSize: 14 }}>Find your perfect life partner</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(26,26,46,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(200,150,45,0.25)',
          borderRadius: 24,
          padding: 40,
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#f5f0e8', marginBottom: 8 }}>
            {step === 'email' ? 'Welcome back' : 'Enter OTP'}
          </h2>
          <p style={{ color: '#9a8f7e', fontSize: 14, marginBottom: 32 }}>
            {step === 'email'
              ? 'Sign in to your account using OTP'
              : `We sent a 6-digit code to ${email}`}
          </p>

          {step === 'email' ? (
            <form onSubmit={handleSendOTP}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#c8962d', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9a8f7e' }} />
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: 44 }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send OTP <ArrowRight size={16} /></>}
              </button>

              <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: '#5a5050', fontSize: 13 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <button type="button" className="btn-google" onClick={handleGoogleLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#c8962d', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  One Time Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9a8f7e' }} />
                  <input
                    className="auth-input otp-input"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{ paddingLeft: 44 }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} /> : <>Verify & Sign In <ArrowRight size={16} /></>}
              </button>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => { setStep('email'); dispatch(clearOTPState()); setOtp(''); }}
                  style={{ background: 'none', border: 'none', color: '#c8962d', cursor: 'pointer', fontSize: 14 }}
                >
                  ← Change email / Resend OTP
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 28, color: '#5a5050', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#c8962d', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
