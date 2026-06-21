import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPatientByMobile, getRecentPatients } from '../services/api'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [mobile, setMobile] = useState('')
  const [patient, setPatient] = useState(null)
  const [recentPatients, setRecentPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [recentLoading, setRecentLoading] = useState(true)
  const name = localStorage.getItem('name')

  useEffect(() => {
    fetchRecentPatients()
  }, [])

  const fetchRecentPatients = async () => {
    try {
      const res = await getRecentPatients()
      setRecentPatients(res.data)
    } catch (err) {
      console.log('Could not load recent patients')
    } finally {
      setRecentLoading(false)
    }
  }

  const searchPatient = async () => {
    if (!mobile.trim()) {
      toast.error('Enter a mobile number')
      return
    }
    setLoading(true)
    setPatient(null)
    try {
      const res = await getPatientByMobile(mobile.trim())
      setPatient(res.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Patient not found')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const severityColor = (severity) => {
    if (severity === 'urgent') return { bg: '#fef2f2', text: '#dc2626' }
    if (severity === 'borderline') return { bg: '#fffbeb', text: '#d97706' }
    return { bg: '#f0fdf4', text: '#16a34a' }
  }

  const reportIcon = (type) => {
    if (type === 'blood') return '🩸'
    if (type === 'xray') return '🫁'
    if (type === 'ecg') return '💓'
    if (type === 'ctscan') return '🧠'
    if (type === 'mri') return '🔬'
    return '📄'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🏥</span>
          <span style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>MediAI</span>
          <span style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px' }}>Doctor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>👨‍⚕️ {name}</span>
          <button onClick={logout} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Search bar */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e40af)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', color: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
            Patient Lookup
          </h2>
          <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '1.2rem' }}>
            Search any patient by their mobile number to view full report history
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchPatient()}
              placeholder="Enter patient mobile number..."
              style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', border: 'none', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={searchPatient}
              disabled={loading}
              style={{ padding: '10px 20px', borderRadius: '10px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: '600', fontSize: '14px' }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Patient result */}
        {patient && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem' }}>

            {/* Patient info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                  👤
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{patient.name}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    {patient.age} yrs • {patient.gender} • 📱 {patient.mobile}
                  </p>
                </div>
              </div>
              <div style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                {patient.reports.length} report{patient.reports.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Clinical summary */}
            {patient.clinical_summary && (
              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', borderLeft: '4px solid #16a34a' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🤖 AI Clinical Summary
                </div>
                <p style={{ fontSize: '14px', color: '#1e293b', lineHeight: '1.7' }}>{patient.clinical_summary}</p>
              </div>
            )}

            {/* Reports list */}
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Report History
            </div>

            {patient.reports.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '1rem' }}>
                No reports found for this patient
              </p>
            )}

            {patient.reports.map((report) => {
              const colors = severityColor(report.severity)
              return (
                <div key={report.report_id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px' }}>{reportIcon(report.report_type)}</span>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b', textTransform: 'capitalize' }}>
                          {report.report_type === 'ctscan' ? 'CT Scan' : report.report_type} Report
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <span style={{ background: colors.bg, color: colors.text, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {report.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: '8px', lineHeight: '1.5', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    {report.summary?.slice(0, 150)}...
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Recent patients */}
        {!patient && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
              Recently Active Patients
            </h3>

            {recentLoading && (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</p>
            )}

            {!recentLoading && recentPatients.length === 0 && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                No recent patient activity yet
              </div>
            )}

            {!recentLoading && recentPatients.map((r, i) => (
              <div
                key={i}
                onClick={() => { setMobile(r.patients?.mobile || ''); searchPatient() }}
                style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px' }}>👤</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                      {r.patients?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {r.patients?.mobile} • {r.report_type} report
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ background: severityColor(r.severity).bg, color: severityColor(r.severity).text, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                    {r.severity}
                  </span>
                  <span style={{ fontSize: '12px', color: '#3b82f6' }}>View →</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}