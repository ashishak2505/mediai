import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const content = {
  en: {
    badge: 'AI-powered medical report analysis',
    h1a: 'Understand your',
    h1b: 'health reports',
    h1c: 'instantly',
    sub: 'Upload any medical report — blood, X-ray, ECG, CT scan — and get a plain-language explanation in seconds. Free, private, instant.',
    patient: 'Upload a Report',
    doctor: "I'm a Doctor",
    featuresTitle: 'Everything you need to understand your health',
    features: [
      { icon: '🩸', title: 'Any report type', desc: 'Blood, X-ray, ECG, CT scan, MRI — all supported with AI analysis' },
      { icon: '💬', title: 'Ask follow-ups', desc: 'Chat with AI about your results in plain language' },
      { icon: '🌐', title: 'Hindi & English', desc: 'Get explanations in the language you understand best' },
      { icon: '👨‍⚕️', title: 'Doctor portal', desc: 'Doctors can track full patient history in one place' },
      { icon: '🔒', title: 'Private & secure', desc: 'Your reports are encrypted and never shared' },
      { icon: '⚡', title: 'Instant results', desc: 'Get your report explained in under 30 seconds' },
    ],
    howTitle: 'How it works',
    steps: [
      { num: '01', title: 'Upload your report', desc: 'PDF or image — blood test, X-ray, ECG, CT scan, MRI' },
      { num: '02', title: 'AI reads it', desc: 'Our AI extracts and analyses every value in your report' },
      { num: '03', title: 'Get plain explanation', desc: 'Understand what your results mean in simple words' },
      { num: '04', title: 'Ask questions', desc: 'Chat with AI about anything in your report' },
    ],
    ctaTitle: 'Ready to understand your health?',
    ctaSub: 'Free forever. No credit card needed.',
    ctaBtn: 'Get Started — It\'s Free',
    footer: 'MediAI is for informational purposes only. Always consult a qualified doctor for medical advice.',
  },
  hi: {
    badge: 'AI से मेडिकल रिपोर्ट का विश्लेषण',
    h1a: 'अपनी',
    h1b: 'स्वास्थ्य रिपोर्ट',
    h1c: 'तुरंत समझें',
    sub: 'कोई भी मेडिकल रिपोर्ट अपलोड करें — ब्लड, X-रे, ECG, CT स्कैन — और सेकंडों में आसान भाषा में समझाइश पाएं। मुफ्त, सुरक्षित, तुरंत।',
    patient: 'रिपोर्ट अपलोड करें',
    doctor: 'मैं डॉक्टर हूं',
    featuresTitle: 'अपनी सेहत समझने के लिए सब कुछ',
    features: [
      { icon: '🩸', title: 'हर रिपोर्ट', desc: 'ब्लड, X-रे, ECG, CT स्कैन, MRI — सब AI से विश्लेषण' },
      { icon: '💬', title: 'सवाल पूछें', desc: 'अपने रिजल्ट के बारे में AI से आसान भाषा में बात करें' },
      { icon: '🌐', title: 'हिंदी और अंग्रेजी', desc: 'अपनी पसंद की भाषा में समझाइश पाएं' },
      { icon: '👨‍⚕️', title: 'डॉक्टर पोर्टल', desc: 'डॉक्टर एक जगह पूरी मरीज़ हिस्ट्री देख सकते हैं' },
      { icon: '🔒', title: 'सुरक्षित और निजी', desc: 'आपकी रिपोर्ट एन्क्रिप्टेड है, कभी शेयर नहीं होती' },
      { icon: '⚡', title: 'तुरंत नतीजे', desc: '30 सेकंड से कम में आपकी रिपोर्ट समझाई जाती है' },
    ],
    howTitle: 'यह कैसे काम करता है',
    steps: [
      { num: '01', title: 'रिपोर्ट अपलोड करें', desc: 'PDF या इमेज — ब्लड टेस्ट, X-रे, ECG, CT स्कैन, MRI' },
      { num: '02', title: 'AI पढ़ता है', desc: 'हमारा AI आपकी रिपोर्ट की हर वैल्यू को पढ़ता और विश्लेषण करता है' },
      { num: '03', title: 'आसान भाषा में समझें', desc: 'जानें कि आपके नतीजों का क्या मतलब है सरल शब्दों में' },
      { num: '04', title: 'सवाल पूछें', desc: 'अपनी रिपोर्ट के बारे में कुछ भी AI से पूछें' },
    ],
    ctaTitle: 'अपनी सेहत समझने के लिए तैयार हैं?',
    ctaSub: 'हमेशा मुफ्त। कोई क्रेडिट कार्ड नहीं चाहिए।',
    ctaBtn: 'शुरू करें — बिल्कुल मुफ्त',
    footer: 'MediAI केवल जानकारी के लिए है। चिकित्सा सलाह के लिए हमेशा योग्य डॉक्टर से मिलें।',
  },
}

const s = {
  page: { background: '#0a0f1e', color: '#f1f5f9', minHeight: '100vh' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: '#0a0f1e', zIndex: 100 },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '600', color: '#f1f5f9' },
  logoDot: { width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  langBtn: (active) => ({ padding: '5px 12px', borderRadius: '6px', border: `0.5px solid ${active ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.12)'}`, background: active ? 'rgba(59,130,246,0.12)' : 'transparent', color: active ? '#60a5fa' : '#64748b', fontSize: '12px', fontWeight: '500' }),
  loginBtn: { padding: '8px 18px', borderRadius: '8px', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '13px', fontWeight: '600' },
  hero: { padding: '80px 32px 64px', textAlign: 'center', maxWidth: '700px', margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '20px', background: 'rgba(59,130,246,0.1)', border: '0.5px solid rgba(59,130,246,0.25)', color: '#60a5fa', fontSize: '12px', marginBottom: '24px' },
  h1: { fontSize: '48px', fontWeight: '700', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-0.5px' },
  h1Accent: { color: '#3b82f6' },
  sub: { fontSize: '17px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '36px' },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { padding: '13px 28px', borderRadius: '10px', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '15px', fontWeight: '600' },
  btnSecondary: { padding: '13px 28px', borderRadius: '10px', background: 'transparent', color: '#94a3b8', border: '0.5px solid rgba(255,255,255,0.15)', fontSize: '15px' },
  section: { padding: '64px 32px', maxWidth: '1000px', margin: '0 auto' },
  sectionTitle: { fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  featureCard: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' },
  featureIcon: { fontSize: '28px', marginBottom: '12px' },
  featureTitle: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' },
  featureDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.6' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  stepCard: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' },
  stepNum: { fontSize: '32px', fontWeight: '700', color: 'rgba(59,130,246,0.3)', marginBottom: '12px' },
  stepTitle: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' },
  stepDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.6' },
  ctaSection: { textAlign: 'center', padding: '64px 32px', background: 'rgba(59,130,246,0.05)', borderTop: '0.5px solid rgba(59,130,246,0.1)', borderBottom: '0.5px solid rgba(59,130,246,0.1)' },
  ctaTitle: { fontSize: '32px', fontWeight: '700', marginBottom: '12px' },
  ctaSub: { fontSize: '15px', color: '#64748b', marginBottom: '28px' },
  footer: { textAlign: 'center', padding: '24px 32px', color: '#334155', fontSize: '12px', borderTop: '0.5px solid rgba(255,255,255,0.06)' },
}

export default function Landing() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('en')
  const t = content[lang]

  return (
    <div style={s.page}>

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={s.logoDot}>🏥</div>
          MediAI
        </div>
        <div style={s.navRight}>
          <button style={s.langBtn(lang === 'en')} onClick={() => setLang('en')}>EN</button>
          <button style={s.langBtn(lang === 'hi')} onClick={() => setLang('hi')}>हि</button>
          <button style={s.loginBtn} onClick={() => navigate('/login')}>Login</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.badge}>✨ {t.badge}</div>
        <h1 style={s.h1}>
          {t.h1a} <span style={s.h1Accent}>{t.h1b}</span> {t.h1c}
        </h1>
        <p style={s.sub}>{t.sub}</p>
        <div style={s.heroBtns}>
          <button style={s.btnPrimary} onClick={() => navigate('/login')}>
            📁 {t.patient}
          </button>
          <button style={s.btnSecondary} onClick={() => navigate('/login')}>
            👨‍⚕️ {t.doctor}
          </button>
        </div>
      </div>

      {/* Sample report preview */}
      <div style={{ maxWidth: '600px', margin: '0 auto 64px', padding: '0 32px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>🩸 Blood Report — Rahul Sharma</div>
            <span style={{ background: 'rgba(220,38,38,0.12)', color: '#f87171', border: '0.5px solid rgba(220,38,38,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
              🚨 Urgent
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '14px' }}>
            {lang === 'en'
              ? 'Your WBC count is slightly elevated, which may suggest your body is fighting an infection. All red blood cell parameters are within normal range.'
              : 'आपका WBC काउंट थोड़ा बढ़ा हुआ है, जो यह सुझाव दे सकता है कि आपका शरीर संक्रमण से लड़ रहा है। सभी RBC पैरामीटर सामान्य सीमा में हैं।'}
          </p>
          {['WBC count: 11,200 cells/cumm (High ↑)', 'Neutrophils: 72% (Elevated)', 'Haemoglobin: 13.8 g/dL (Normal ✓)'].map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 2 ? '#16a34a' : '#3b82f6', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#64748b' }}>{f}</span>
            </div>
          ))}
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
            <p style={{ fontSize: '12px', color: '#fca5a5', lineHeight: '1.6' }}>
              {lang === 'en' ? '⚡ Please consult your doctor soon — Dr. Priya Mehta recommended.' : '⚡ कृपया जल्द डॉक्टर से मिलें — Dr. Priya Mehta की सलाह है।'}
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>{t.featuresTitle}</h2>
        <div style={s.featuresGrid}>
          {t.features.map((f, i) => (
            <div key={i} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ ...s.section, background: 'rgba(255,255,255,0.01)', borderTop: '0.5px solid rgba(255,255,255,0.06)', borderBottom: '0.5px solid rgba(255,255,255,0.06)', maxWidth: '100%', padding: '64px 32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={s.sectionTitle}>{t.howTitle}</h2>
          <div style={s.stepsGrid}>
            {t.steps.map((step, i) => (
              <div key={i} style={s.stepCard}>
                <div style={s.stepNum}>{step.num}</div>
                <div style={s.stepTitle}>{step.title}</div>
                <div style={s.stepDesc}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={s.ctaSection}>
        <h2 style={s.ctaTitle}>{t.ctaTitle}</h2>
        <p style={s.ctaSub}>{t.ctaSub}</p>
        <button style={{ ...s.btnPrimary, fontSize: '16px', padding: '14px 32px' }} onClick={() => navigate('/login')}>
          {t.ctaBtn} →
        </button>
      </div>

      {/* Footer */}
      <div style={s.footer}>{t.footer}</div>

    </div>
  )
}