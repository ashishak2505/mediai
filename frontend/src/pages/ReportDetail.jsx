import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getReport, chatAboutReport } from '../services/api'
import toast from 'react-hot-toast'

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchReport()
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const fetchReport = async () => {
    try {
      const res = await getReport(id)
      setReport(res.data)
    } catch (err) {
      toast.error('Could not load report')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return
    const userMsg = { role: 'user', content: message }
    setChatHistory(prev => [...prev, userMsg])
    setMessage('')
    setChatLoading(true)
    try {
      const res = await chatAboutReport({
        report_id: id,
        message: userMsg.content,
        history: chatHistory,
      })
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.answer }])
    } catch (err) {
      toast.error('Could not get response')
    } finally {
      setChatLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const severityConfig = {
    normal: { bg: '#f0fdf4', text: '#16a34a', label: '✅ Normal' },
    borderline: { bg: '#fffbeb', text: '#d97706', label: '⚠️ Borderline' },
    urgent: { bg: '#fef2f2', text: '#dc2626', label: '🚨 Urgent' },
  }

  const reportIcon = (type) => {
    if (type === 'blood') return '🩸'
    if (type === 'xray') return '🫁'
    if (type === 'ecg') return '💓'
    if (type === 'ctscan') return '🧠'
    if (type === 'mri') return '🔬'
    return '📄'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Loading report...
    </div>
  )

  if (!report) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Report not found
    </div>
  )

  const severity = severityConfig[report.severity] || severityConfig.borderline

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

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Report header */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '36px' }}>{reportIcon(report.report_type)}</span>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' }}>
                  {report.report_type === 'ctscan' ? 'CT Scan' : report.report_type} Report
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                  {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <span style={{ background: severity.bg, color: severity.text, padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              {severity.label}
            </span>
          </div>

          {/* Summary */}
          <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI Summary
            </div>
            <p style={{ fontSize: '14px', color: '#1e293b', lineHeight: '1.7' }}>{report.summary}</p>
          </div>

          {/* Key findings */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Key Findings
            </div>
            {report.key_findings?.map((finding, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                <span style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }}>•</span>
                <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>{finding}</span>
              </div>
            ))}
          </div>

          {/* What to do */}
          <div style={{ background: report.severity === 'urgent' ? '#fef2f2' : '#eff6ff', borderRadius: '10px', padding: '1rem', borderLeft: `4px solid ${report.severity === 'urgent' ? '#dc2626' : '#3b82f6'}` }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: report.severity === 'urgent' ? '#dc2626' : '#3b82f6', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              What should you do?
            </div>
            <p style={{ fontSize: '14px', color: '#1e293b', lineHeight: '1.6' }}>{report.what_to_do}</p>
          </div>
        </div>

        {/* Chat section */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
              💬 Ask questions about this report
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Ask anything — in English or Hindi
            </p>
          </div>

          {/* Chat messages */}
          <div style={{ height: '320px', overflowY: 'auto', padding: '1rem' }}>
            {chatHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
                <p style={{ fontSize: '13px' }}>Ask me anything about your report</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                  {[
                    'Is my result normal?',
                    'Should I be worried?',
                    'What does WBC mean?',
                    'मेरी रिपोर्ट कैसी है?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setMessage(q)}
                      style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '12px', cursor: 'pointer' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? '#3b82f6' : '#f1f5f9',
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  fontSize: '14px',
                  lineHeight: '1.6',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: '#f1f5f9', color: '#94a3b8', fontSize: '14px' }}>
                  Thinking...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your report... (English या Hindi में)"
              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || chatLoading}
              style={{ padding: '10px 18px', borderRadius: '10px', background: !message.trim() || chatLoading ? '#94a3b8' : '#3b82f6', color: '#fff', border: 'none', fontWeight: '600', fontSize: '14px' }}
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}