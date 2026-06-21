import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerPatient, registerDoctor } from '../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'registerPatient' | 'registerDoctor'
  const [role, setRole] = useState('patient')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '', mobile: '', email: '', age: '',
    gender: 'male', password: '', specialization: '',
    registration_number: '',
  })

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginUser({
        identifier: role === 'patient' ? form.mobile : form.email,
        password: form.password,
        role,
      })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('name', res.data.name)
      localStorage.setItem('user_id', res.data.user_id)
      toast.success(`Welcome back, ${res.data.name}!`)
      navigate(role === 'patient' ? '/patient' : '/doctor')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterPatient = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await registerPatient({
        name: form.name,
        mobile: form.mobile,
        age: parseInt(form.age),
        gender: form.gender,
        password: form.password,
      })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('role', 'patient')
      localStorage.setItem('name', res.data.name)
      localStorage.setItem('user_id', res.data.user_id)
      toast.success('Account created!')
      navigate('/patient')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterDoctor = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await registerDoctor({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        specialization: form.specialization,
        registration_number: form.registration_number,
        password: form.password,
      })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('role', 'doctor')
      localStorage.setItem('name', res.data.name)
      localStorage.setItem('user_id', res.data.user_id)
      toast.success('Doctor account created!')
      navigate('/doctor')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '14px', marginBottom: '12px',
    outline: 'none',
  }

  const btnStyle = {
    width: '100%', padding: '12px', borderRadius: '8px',
    background: '#3b82f6', color: '#fff', border: 'none',
    fontSize: '15px', fontWeight: '600', marginTop: '4px',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '32px' }}>🏥</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>MediAI</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>AI-powered medical report assistant</p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          {['login', 'registerPatient', 'registerDoctor'].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none',
              background: mode === m ? '#3b82f6' : '#f1f5f9',
              color: mode === m ? '#fff' : '#64748b',
              fontSize: '12px', fontWeight: '500',
            }}>
              {m === 'login' ? 'Login' : m === 'registerPatient' ? 'Patient Signup' : 'Doctor Signup'}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {['patient', 'doctor'].map((r) => (
                <button type="button" key={r} onClick={() => setRole(r)} style={{
                  flex: 1, padding: '8px', borderRadius: '8px',
                  border: `2px solid ${role === r ? '#3b82f6' : '#e2e8f0'}`,
                  background: role === r ? '#eff6ff' : '#fff',
                  color: role === r ? '#3b82f6' : '#64748b',
                  fontWeight: '500', fontSize: '13px',
                }}>
                  {r === 'patient' ? '👤 Patient' : '👨‍⚕️ Doctor'}
                </button>
              ))}
            </div>
            <input style={inputStyle}name={role === 'patient' ? 'mobile' : 'email'}
            placeholder={role === 'patient' ? 'Mobile number' : 'Email address'}
            value={role === 'patient' ? form.mobile : form.email}onChange={update}
            required/>
            <input style={inputStyle} name="password" type="password"
              placeholder="Password" value={form.password} onChange={update} required />
            <button style={btnStyle} type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* PATIENT REGISTER FORM */}
        {mode === 'registerPatient' && (
          <form onSubmit={handleRegisterPatient}>
            <input style={inputStyle} name="name" placeholder="Full name" value={form.name} onChange={update} required />
            <input style={inputStyle} name="mobile" placeholder="Mobile number" value={form.mobile} onChange={update} required />
            <input style={inputStyle} name="age" type="number" placeholder="Age" value={form.age} onChange={update} required />
            <select style={inputStyle} name="gender" value={form.gender} onChange={update}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input style={inputStyle} name="password" type="password" placeholder="Password" value={form.password} onChange={update} required />
            <button style={btnStyle} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Patient Account'}
            </button>
          </form>
        )}

        {/* DOCTOR REGISTER FORM */}
        {mode === 'registerDoctor' && (
          <form onSubmit={handleRegisterDoctor}>
            <input style={inputStyle} name="name" placeholder="Full name" value={form.name} onChange={update} required />
            <input style={inputStyle} name="email" type="email" placeholder="Email address" value={form.email} onChange={update} required />
            <input style={inputStyle} name="mobile" placeholder="Mobile number" value={form.mobile} onChange={update} required />
            <input style={inputStyle} name="specialization" placeholder="Specialization (e.g. Cardiology)" value={form.specialization} onChange={update} required />
            <input style={inputStyle} name="registration_number" placeholder="Medical registration number" value={form.registration_number} onChange={update} required />
            <input style={inputStyle} name="password" type="password" placeholder="Password" value={form.password} onChange={update} required />
            <button style={btnStyle} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Doctor Account'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}