import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyReports } from '../services/api'
import toast from 'react-hot-toast'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const name = localStorage.getItem('name')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await getMyReports()
      setReports(res.data)
    } catch (err) {
      toast.error('Could not load reports')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const severityColor = (severity) => {
    if (severity === 'urgent') return { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626' }
    if (severity === 'borderline') return { bg: '#fffbeb', text: '#d97706', dot: '#d97706' }
    return { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' }
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
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>👤 {name}</span>
          <button onClick={logout} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Welcome banner */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '16px', padding: '1.5rem', color: '#fff', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Welcome, {name} 👋</h2>
          <p style={{ fontSize: '14px', opacity: 0.85 }}>Upload your medical reports and get instant AI-powered explanations</p>
          <button
            onClick={() => navigate('/patient/upload')}
            style={{ marginTop: '1rem', padding: '10px 20px', borderRadius: '8px', background: '#fff', color: '#3b82f6', border: 'none', fontWeight: '600', fontSize: '14px' }}
          >
            + Upload New Report
          </button>
        </div>

        {/* Reports section */}
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
          Your Reports ({reports.length})
        </h3>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            Loading your reports...
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📋</div>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>No reports uploaded yet</p>
            <button
              onClick={() => navigate('/patient/upload')}
              style={{ padding: '10px 20px', borderRadius: '8px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: '600' }}
            >
              Upload your first report
            </button>
          </div>
        )}

        {!loading && reports.map((report) => {
          const colors = severityColor(report.severity)
          return (
            <div
              key={report.report_id}
              onClick={() => navigate(`/patient/report/${report.report_id}`)}
              style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.2rem', marginBottom: '12px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '28px' }}>{reportIcon(report.report_type)}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#1e293b', textTransform: 'capitalize' }}>
                      {report.report_type === 'ctscan' ? 'CT Scan' : report.report_type} Report
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{report.file_name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ background: colors.bg, color: colors.text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                    ● {report.severity}
                  </span>
                  <span style={{ fontSize: '12px', color: '#3b82f6' }}>View details →</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '10px', lineHeight: '1.5', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                {report.summary?.slice(0, 120)}...
              </p>
            </div>
          )
        })}

      </div>
    </div>
  )
}