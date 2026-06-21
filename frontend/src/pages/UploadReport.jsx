import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadReport } from '../services/api'
import toast from 'react-hot-toast'

export default function UploadReport() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (selected) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowed.includes(selected.type)) {
      toast.error('Only PDF, JPG, PNG or WEBP files allowed')
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB.')
      return
    }
    setFile(selected)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadReport(formData)
      toast.success('Report analysed successfully!')
      navigate(`/patient/report/${res.data.report_id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🏥</span>
          <span style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>MediAI</span>
        </div>
        <button
          onClick={() => navigate('/patient')}
          style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px' }}
        >
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
          Upload Medical Report
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '2rem' }}>
          Upload a blood report, X-ray, ECG, CT scan or MRI — our AI will explain it in simple language.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            border: `2px dashed ${dragOver ? '#3b82f6' : file ? '#16a34a' : '#cbd5e1'}`,
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? '#eff6ff' : file ? '#f0fdf4' : '#fff',
            transition: 'all 0.2s',
            marginBottom: '1.5rem',
          }}
        >
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />

          {file ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <div style={{ fontWeight: '600', color: '#16a34a', fontSize: '15px' }}>{file.name}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Click to change file</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
              <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>
                Drag & drop your report here
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                or click to browse files
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '12px' }}>
                Supports PDF, JPG, PNG, WEBP — max 10MB
              </div>
            </>
          )}
        </div>

        {/* Supported types info */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {['🩸 Blood Report', '🫁 X-Ray', '💓 ECG', '🧠 CT Scan', '🔬 MRI'].map((t) => (
            <span key={t} style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Upload button */}
        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px',
            background: !file || loading ? '#94a3b8' : '#3b82f6',
            color: '#fff', border: 'none', fontSize: '15px',
            fontWeight: '600', transition: 'background 0.2s',
          }}
        >
          {loading ? '🔍 Analysing your report...' : '✨ Analyse Report with AI'}
        </button>

        {loading && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '1rem' }}>
            This may take 10-20 seconds depending on report size...
          </p>
        )}
      </div>
    </div>
  )
}