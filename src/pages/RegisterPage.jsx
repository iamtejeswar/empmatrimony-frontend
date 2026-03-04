// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, verifyOTP, register, clearError, clearOTPState } from '../store/authSlice';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const iStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,45,0.3)', borderRadius: 10, padding: '12px 14px', color: '#f5f0e8', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' };
const lStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#c8962d', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' };

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent, otpVerified, isAuthenticated, redirectTo, welcomeMessage, user } = useSelector((s) => s.auth);

  const [step, setStep] = useState('form'); // form | otp
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', dateOfBirth: '', gender: '', password: '' });
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (welcomeMessage) toast.success(welcomeMessage);
      navigate(redirectTo || '/profile/complete');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error]);

  useEffect(() => {
    if (otpSent && step === 'form') { setStep('otp'); toast.success('OTP sent! Check your email.'); }
  }, [otpSent]);

  useEffect(() => {
    if (otpVerified && step === 'otp') {
      dispatch(register(form));
    }
  }, [otpVerified]);

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!form.email || !form.firstName || !form.lastName || !form.gender || !form.dateOfBirth) {
      return toast.error('Please fill all required fields');
    }
    dispatch(sendOTP({ email: form.email, purpose: 'registration' }));
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP');
    dispatch(verifyOTP({ email: form.email, otp }));
  };

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0d1257 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@400;600;700&display=swap'); input:focus,select:focus{border-color:#c8962d!important;} input[type="date"],input[type="text"],input[type="email"],input[type="tel"],select{color-scheme:dark;}`}</style>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 12px', background: 'linear-gradient(135deg,#c8962d,#f0c050)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={26} color="#1a1a00" fill="#1a1a00" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif" }}>Create Account</h1>
          <p style={{ color: '#9a8f7e', fontSize: 14 }}>Join thousands finding their perfect match</p>
        </div>

        <div style={{ background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(200,150,45,0.25)', borderRadius: 24, padding: 36, boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
          {step === 'form' ? (
            <form onSubmit={handleSendOTP}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div><label style={lStyle}>First Name *</label><input style={iStyle} placeholder="Ravi" value={form.firstName} onChange={e => update('firstName', e.target.value)} required /></div>
                <div><label style={lStyle}>Last Name *</label><input style={iStyle} placeholder="Kumar" value={form.lastName} onChange={e => update('lastName', e.target.value)} required /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={lStyle}>Email Address *</label><input type="email" style={iStyle} placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} required /></div>
              <div style={{ marginBottom: 14 }}><label style={lStyle}>Mobile Number</label><input type="tel" style={iStyle} placeholder="+91 9999999999" value={form.mobile} onChange={e => update('mobile', e.target.value)} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div><label style={lStyle}>Date of Birth *</label><input type="date" style={iStyle} value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} required /></div>
                <div>
                  <label style={lStyle}>Gender *</label>
                  <select style={iStyle} value={form.gender} onChange={e => update('gender', e.target.value)} required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#c8962d,#f0c050)', border: 'none', color: '#1a1a00', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                {loading ? <Loader2 size={18} /> : <>Send OTP <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <p style={{ color: '#9a8f7e', fontSize: 14 }}>We sent a 6-digit OTP to</p>
                <p style={{ color: '#f0c050', fontWeight: 600 }}>{form.email}</p>
              </div>
              <div style={{ marginBottom: 20 }}><label style={lStyle}>Enter OTP</label>
                <input className="otp-input" style={{ ...iStyle, letterSpacing: 12, textAlign: 'center', fontSize: 28, fontWeight: 700 }} maxLength={6} placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#c8962d,#f0c050)', border: 'none', color: '#1a1a00', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <Loader2 size={18} /> : <>Verify & Create Account</>}
              </button>
              <button type="button" onClick={() => { setStep('form'); dispatch(clearOTPState()); setOtp(''); }} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', color: '#c8962d', cursor: 'pointer', fontSize: 14 }}>← Change email</button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, color: '#5a5050', fontSize: 14 }}>
            Already have an account? <Link to="/login" style={{ color: '#c8962d', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
