// src/pages/ProfileCompletePage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { profileAPI, documentAPI } from '../services/api';
import { updateUser } from '../store/authSlice';
import toast from 'react-hot-toast';
import { Check, ChevronRight, Upload, User, Users, Briefcase, Star, FileText, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal', icon: User, desc: 'Your details' },
  { id: 2, title: 'Family', icon: Users, desc: 'Family info' },
  { id: 3, title: 'Employment', icon: Briefcase, desc: 'Career info' },
  { id: 4, title: 'Community', icon: Star, desc: 'Horoscope' },
  { id: 5, title: 'Documents', icon: FileText, desc: 'Upload docs' },
];

const RAASIS = ['Mesham','Rishabam','Mithunam','Kadagam','Simmam','Kanni','Thulam','Viruchigam','Dhanusu','Magaram','Kumbam','Meenam'];
const STARS = ['Ashwini','Bharani','Krithigai','Rohini','Mirugasirisham','Thiruvathirai','Punarpoosam','Poosam','Ayilyam','Magam','Pooram','Uthiram','Hastham','Chithirai','Swathi','Vishakam','Anusham','Kettai','Moolam','Pooradam','Uthiradam','Thiruvonam','Avittam','Sadhayam','Poorattathi','Uthirattathi','Revathi'];
const DOC_TYPES = [
  { value: 'profile_picture', label: '📷 Profile Picture' },
  { value: 'aadhaar', label: '🪪 Aadhaar Card' },
  { value: 'pan', label: '💳 PAN Card' },
  { value: 'driving_license', label: '🚗 Driving License' },
  { value: 'employee_id', label: '🏢 Employee ID' },
  { value: 'payslip', label: '💰 Payslip' },
  { value: 'passport', label: '🛂 Passport' },
];

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,45,0.3)',
  borderRadius: 10, padding: '12px 14px', color: '#f5f0e8', fontSize: 14, fontFamily: 'Inter, sans-serif',
  outline: 'none', transition: 'all 0.2s',
};

const selectStyle = { ...inputStyle };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#c8962d', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' };

function FieldGroup({ label, children }) {
  return <div style={{ marginBottom: 20 }}><label style={labelStyle}>{label}</label>{children}</div>;
}

export default function ProfileCompletePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [currentStep, setCurrentStep] = useState(user?.profileCompletionStep + 1 || 1);
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // Form states
  const [step1, setStep1] = useState({ maritalStatus: '', height: '', weight: '', motherTongue: '', citizenship: 'India', aboutMe: '' });
  const [step2, setStep2] = useState({ fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '', familyContactNumber: '', numberOfBrothers: 0, numberOfSisters: 0, permanentAddress: '', city: '', state: '', pincode: '', familyType: '', familyStatus: '' });
  const [step3, setStep3] = useState({ highestEducation: '', employmentType: '', departmentCompanyName: '', jobRole: '', monthlySalary: '', workingSince: '', officeAddress: '', officeCity: '' });
  const [step4, setStep4] = useState({ religion: '', caste: '', subCaste: '', raasi: '', star: '', dhosham: '', physicallychallenged: false, birthTime: '', birthPlace: '', preferredCommunity: false });
  const [docType, setDocType] = useState('profile_picture');
  const [docFile, setDocFile] = useState(null);

  const save = async (step, data, apiCall) => {
    setLoading(true);
    try {
      await apiCall(data);
      dispatch(updateUser({ profileCompletionStep: step }));
      if (step < 5) {
        setCurrentStep(step + 1);
        toast.success('Saved! Continue to next step.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!docFile) return toast.error('Select a file first');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('document', docFile);
      form.append('documentType', docType);
      await documentAPI.upload(form);
      setUploadedDocs((prev) => [...prev, docType]);
      setDocFile(null);
      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await profileAPI.completeProfile();
      dispatch(updateUser({ isProfileComplete: true, profileCompletionStep: 5 }));
      toast.success('🎉 Profile complete! Awaiting admin approval.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        input[type="text"],input[type="number"],input[type="date"],input[type="time"],input[type="tel"],textarea,select { color-scheme: dark; }
        input:focus,select:focus,textarea:focus { border-color: #c8962d !important; box-shadow: 0 0 0 3px rgba(200,150,45,0.15) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0c050', fontFamily: "'Cormorant Garamond', serif", marginBottom: 8 }}>
          Complete Your Profile
        </h1>
        <p style={{ color: '#9a8f7e' }}>Step {currentStep} of 5 — {STEPS[currentStep - 1].desc}</p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 24, left: '10%', right: '10%', height: 2,
          background: 'rgba(200,150,45,0.2)', zIndex: 0,
        }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#c8962d,#f0c050)', width: `${((currentStep - 1) / 4) * 100}%`, transition: 'width 0.5s ease' }} />
        </div>

        {STEPS.map((step) => {
          const Icon = step.icon;
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1, flex: 1 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'linear-gradient(135deg,#c8962d,#f0c050)' : active ? 'rgba(200,150,45,0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${done || active ? '#c8962d' : 'rgba(255,255,255,0.1)'}`,
                transition: 'all 0.3s',
              }}>
                {done ? <Check size={20} color="#1a1a00" /> : <Icon size={18} color={active ? '#c8962d' : '#5a5050'} />}
              </div>
              <div style={{ fontSize: 11, fontWeight: done || active ? 600 : 400, color: done || active ? '#c8962d' : '#5a5050', textAlign: 'center' }}>
                {step.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <div style={{
        background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(200,150,45,0.25)', borderRadius: 24, padding: 40,
      }}>
        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f0e8', marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Personal Details</h2>
            <p style={{ color: '#9a8f7e', fontSize: 14, marginBottom: 28 }}>Tell us about yourself</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FieldGroup label="Full Name (Auto-filled)">
                <input style={{ ...inputStyle, opacity: 0.5 }} value={`${user?.firstName} ${user?.lastName}`} disabled />
              </FieldGroup>
              <FieldGroup label="Date of Birth (Auto-filled)">
                <input style={{ ...inputStyle, opacity: 0.5 }} value={user?.dateOfBirth || ''} disabled />
              </FieldGroup>
              <FieldGroup label="Gender (Auto-filled)">
                <input style={{ ...inputStyle, opacity: 0.5, textTransform: 'capitalize' }} value={user?.gender || ''} disabled />
              </FieldGroup>
              <FieldGroup label="Marital Status *">
                <select style={selectStyle} value={step1.maritalStatus} onChange={(e) => setStep1({...step1, maritalStatus: e.target.value})}>
                  <option value="">Select Status</option>
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="awaiting_divorce">Awaiting Divorce</option>
                </select>
              </FieldGroup>
              <FieldGroup label="Height (cm)">
                <input type="number" style={inputStyle} placeholder="170" value={step1.height} onChange={(e) => setStep1({...step1, height: e.target.value})} />
              </FieldGroup>
              <FieldGroup label="Weight (kg)">
                <input type="number" style={inputStyle} placeholder="65" value={step1.weight} onChange={(e) => setStep1({...step1, weight: e.target.value})} />
              </FieldGroup>
              <FieldGroup label="Mother Tongue">
                <input style={inputStyle} placeholder="Tamil, Hindi, Telugu..." value={step1.motherTongue} onChange={(e) => setStep1({...step1, motherTongue: e.target.value})} />
              </FieldGroup>
              <FieldGroup label="Citizenship">
                <input style={inputStyle} placeholder="Indian" value={step1.citizenship} onChange={(e) => setStep1({...step1, citizenship: e.target.value})} />
              </FieldGroup>
            </div>
            <FieldGroup label="About Me">
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Tell potential matches about yourself..." value={step1.aboutMe} onChange={(e) => setStep1({...step1, aboutMe: e.target.value})} />
            </FieldGroup>
          </div>
        )}

        {/* STEP 2: Family Details */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f0e8', marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Family Details</h2>
            <p style={{ color: '#9a8f7e', fontSize: 14, marginBottom: 28 }}>Share your family background</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FieldGroup label="Father's Name"><input style={inputStyle} placeholder="Father's full name" value={step2.fatherName} onChange={(e) => setStep2({...step2, fatherName: e.target.value})} /></FieldGroup>
              <FieldGroup label="Father's Occupation"><input style={inputStyle} placeholder="Occupation" value={step2.fatherOccupation} onChange={(e) => setStep2({...step2, fatherOccupation: e.target.value})} /></FieldGroup>
              <FieldGroup label="Mother's Name"><input style={inputStyle} placeholder="Mother's full name" value={step2.motherName} onChange={(e) => setStep2({...step2, motherName: e.target.value})} /></FieldGroup>
              <FieldGroup label="Mother's Occupation"><input style={inputStyle} placeholder="Occupation" value={step2.motherOccupation} onChange={(e) => setStep2({...step2, motherOccupation: e.target.value})} /></FieldGroup>
              <FieldGroup label="Family Contact Number"><input type="tel" style={inputStyle} placeholder="+91 9999999999" value={step2.familyContactNumber} onChange={(e) => setStep2({...step2, familyContactNumber: e.target.value})} /></FieldGroup>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Brothers"><input type="number" style={inputStyle} min="0" value={step2.numberOfBrothers} onChange={(e) => setStep2({...step2, numberOfBrothers: e.target.value})} /></FieldGroup>
                <FieldGroup label="Sisters"><input type="number" style={inputStyle} min="0" value={step2.numberOfSisters} onChange={(e) => setStep2({...step2, numberOfSisters: e.target.value})} /></FieldGroup>
              </div>
              <FieldGroup label="Family Type">
                <select style={selectStyle} value={step2.familyType} onChange={(e) => setStep2({...step2, familyType: e.target.value})}>
                  <option value="">Select</option>
                  <option value="nuclear">Nuclear</option>
                  <option value="joint">Joint</option>
                  <option value="extended">Extended</option>
                </select>
              </FieldGroup>
              <FieldGroup label="Family Status">
                <select style={selectStyle} value={step2.familyStatus} onChange={(e) => setStep2({...step2, familyStatus: e.target.value})}>
                  <option value="">Select</option>
                  <option value="middle_class">Middle Class</option>
                  <option value="upper_middle_class">Upper Middle Class</option>
                  <option value="rich">Rich</option>
                  <option value="affluent">Affluent</option>
                </select>
              </FieldGroup>
            </div>
            <FieldGroup label="Permanent Address"><textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Full address" value={step2.permanentAddress} onChange={(e) => setStep2({...step2, permanentAddress: e.target.value})} /></FieldGroup>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <FieldGroup label="City"><input style={inputStyle} placeholder="City" value={step2.city} onChange={(e) => setStep2({...step2, city: e.target.value})} /></FieldGroup>
              <FieldGroup label="State"><input style={inputStyle} placeholder="State" value={step2.state} onChange={(e) => setStep2({...step2, state: e.target.value})} /></FieldGroup>
              <FieldGroup label="Pincode"><input style={inputStyle} placeholder="600001" value={step2.pincode} onChange={(e) => setStep2({...step2, pincode: e.target.value})} /></FieldGroup>
            </div>
          </div>
        )}

        {/* STEP 3: Employment */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f0e8', marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Employment Details</h2>
            <p style={{ color: '#9a8f7e', fontSize: 14, marginBottom: 28 }}>Your education and career</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FieldGroup label="Highest Education"><input style={inputStyle} placeholder="B.Tech, MBA, MBBS..." value={step3.highestEducation} onChange={(e) => setStep3({...step3, highestEducation: e.target.value})} /></FieldGroup>
              <FieldGroup label="Employment Type">
                <select style={selectStyle} value={step3.employmentType} onChange={(e) => setStep3({...step3, employmentType: e.target.value})}>
                  <option value="">Select Type</option>
                  <option value="state_government">State Government</option>
                  <option value="central_government">Central Government</option>
                  <option value="psu">PSU</option>
                  <option value="banking">Banking</option>
                  <option value="private">Private</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="others">Others</option>
                  <option value="unemployed">Currently Unemployed</option>
                </select>
              </FieldGroup>
              <FieldGroup label="Company / Department"><input style={inputStyle} placeholder="TCS, ISRO, SBI..." value={step3.departmentCompanyName} onChange={(e) => setStep3({...step3, departmentCompanyName: e.target.value})} /></FieldGroup>
              <FieldGroup label="Job Role / Designation"><input style={inputStyle} placeholder="Software Engineer, Manager..." value={step3.jobRole} onChange={(e) => setStep3({...step3, jobRole: e.target.value})} /></FieldGroup>
              <FieldGroup label="Monthly Salary (₹)"><input type="number" style={inputStyle} placeholder="50000" value={step3.monthlySalary} onChange={(e) => setStep3({...step3, monthlySalary: e.target.value})} /></FieldGroup>
              <FieldGroup label="Working Since"><input type="date" style={inputStyle} value={step3.workingSince} onChange={(e) => setStep3({...step3, workingSince: e.target.value})} /></FieldGroup>
            </div>
            <FieldGroup label="Office Address"><textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Office / Company address" value={step3.officeAddress} onChange={(e) => setStep3({...step3, officeAddress: e.target.value})} /></FieldGroup>
          </div>
        )}

        {/* STEP 4: Community & Horoscope */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f0e8', marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Community & Horoscope</h2>
            <p style={{ color: '#9a8f7e', fontSize: 14, marginBottom: 28 }}>Religion, caste, and astrological details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FieldGroup label="Religion">
                <select style={selectStyle} value={step4.religion} onChange={(e) => setStep4({...step4, religion: e.target.value})}>
                  <option value="">Select Religion</option>
                  {['Hindu','Muslim','Christian','Sikh','Jain','Buddhist','Others'].map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Caste">
                <select style={selectStyle} value={step4.caste} onChange={(e) => setStep4({...step4, caste: e.target.value})}>
                  <option value="">Select Caste</option>
                  {['OC','BC','MBC','SC','ST','Others'].map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Sub Caste"><input style={inputStyle} placeholder="Mudaliar, Nadar, Gounder..." value={step4.subCaste} onChange={(e) => setStep4({...step4, subCaste: e.target.value})} /></FieldGroup>
              <FieldGroup label="Raasi (Moon Sign)">
                <select style={selectStyle} value={step4.raasi} onChange={(e) => setStep4({...step4, raasi: e.target.value})}>
                  <option value="">Select Raasi</option>
                  {RAASIS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Star (Nakshatra)">
                <select style={selectStyle} value={step4.star} onChange={(e) => setStep4({...step4, star: e.target.value})}>
                  <option value="">Select Star</option>
                  {STARS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Dhosham">
                <select style={selectStyle} value={step4.dhosham} onChange={(e) => setStep4({...step4, dhosham: e.target.value})}>
                  <option value="">Select Dhosham</option>
                  <option value="no">No Dhosham</option>
                  <option value="yes">Yes</option>
                  <option value="partial">Partial</option>
                  <option value="chevvai_dosham">Chevvai Dosham</option>
                  <option value="rahu_dosham">Rahu Dosham</option>
                </select>
              </FieldGroup>
              <FieldGroup label="Birth Time"><input type="time" style={inputStyle} value={step4.birthTime} onChange={(e) => setStep4({...step4, birthTime: e.target.value})} /></FieldGroup>
              <FieldGroup label="Birth Place"><input style={inputStyle} placeholder="City of birth" value={step4.birthPlace} onChange={(e) => setStep4({...step4, birthPlace: e.target.value})} /></FieldGroup>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#f5f0e8', fontSize: 14 }}>
                <input type="checkbox" checked={step4.physicallychallenged} onChange={(e) => setStep4({...step4, physicallychallenged: e.target.checked})} style={{ width: 18, height: 18, accentColor: '#c8962d' }} />
                Physically Challenged
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#f5f0e8', fontSize: 14 }}>
                <input type="checkbox" checked={step4.preferredCommunity} onChange={(e) => setStep4({...step4, preferredCommunity: e.target.checked})} style={{ width: 18, height: 18, accentColor: '#c8962d' }} />
                Match within same community only
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Documents */}
        {currentStep === 5 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f0e8', marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Upload Documents</h2>
            <p style={{ color: '#9a8f7e', fontSize: 14, marginBottom: 28 }}>Upload your documents for verification (max 10MB each, JPEG/PNG/PDF)</p>

            {/* Uploaded Documents */}
            {uploadedDocs.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: '#c8962d', fontWeight: 600, marginBottom: 12 }}>Uploaded:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {uploadedDocs.map((d) => (
                    <span key={d} style={{ background: 'rgba(200,150,45,0.15)', border: '1px solid rgba(200,150,45,0.4)', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#f0c050' }}>
                      ✓ {DOC_TYPES.find(t => t.value === d)?.label || d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <FieldGroup label="Document Type">
              <select style={selectStyle} value={docType} onChange={(e) => setDocType(e.target.value)}>
                {DOC_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </FieldGroup>

            <div style={{
              border: '2px dashed rgba(200,150,45,0.3)', borderRadius: 16, padding: 40,
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
              background: docFile ? 'rgba(200,150,45,0.05)' : 'transparent',
            }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <Upload size={40} color="#c8962d" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#f5f0e8', fontSize: 15, marginBottom: 6 }}>
                {docFile ? docFile.name : 'Click to select file'}
              </p>
              <p style={{ color: '#9a8f7e', fontSize: 13 }}>JPEG, PNG, PDF — Max 10MB</p>
              <input
                id="file-input" type="file" accept=".jpg,.jpeg,.png,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => setDocFile(e.target.files[0])}
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !docFile}
              style={{
                width: '100%', marginTop: 16, background: 'rgba(200,150,45,0.15)', border: '1px solid rgba(200,150,45,0.4)',
                color: '#f0c050', padding: '12px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? <Loader2 size={16} /> : <><Upload size={16} /> Upload Document</>}
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px solid rgba(200,150,45,0.15)' }}>
          {currentStep > 1 ? (
            <button onClick={() => setCurrentStep(currentStep - 1)} style={{
              background: 'transparent', border: '1px solid rgba(200,150,45,0.3)', color: '#c8962d',
              padding: '12px 24px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>
              ← Back
            </button>
          ) : <div />}

          {currentStep < 5 ? (
            <button
              onClick={() => {
                const actions = [
                  () => save(1, step1, profileAPI.saveStep1),
                  () => save(2, step2, profileAPI.saveStep2),
                  () => save(3, step3, profileAPI.saveStep3),
                  () => save(4, step4, profileAPI.saveStep4),
                ];
                actions[currentStep - 1]?.();
              }}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg,#c8962d,#f0c050)', border: 'none',
                color: '#1a1a00', padding: '12px 32px', borderRadius: 12, cursor: 'pointer',
                fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {loading ? <Loader2 size={16} /> : <>Save & Continue <ChevronRight size={16} /></>}
            </button>
          ) : (
            <button onClick={handleComplete} disabled={loading} style={{
              background: 'linear-gradient(135deg,#c8962d,#f0c050)', border: 'none',
              color: '#1a1a00', padding: '12px 32px', borderRadius: 12, cursor: 'pointer',
              fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {loading ? <Loader2 size={16} /> : <>🎉 Complete Profile</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
