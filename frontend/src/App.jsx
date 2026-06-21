import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import UploadReport from './pages/UploadReport'
import ReportDetail from './pages/ReportDetail'

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')
  if (!token) return <Navigate to="/login" />
  if (role && userRole !== role) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/patient" element={
        <PrivateRoute role="patient">
          <PatientDashboard />
        </PrivateRoute>
      } />

      <Route path="/patient/upload" element={
        <PrivateRoute role="patient">
          <UploadReport />
        </PrivateRoute>
      } />

      <Route path="/patient/report/:id" element={
        <PrivateRoute role="patient">
          <ReportDetail />
        </PrivateRoute>
      } />

      <Route path="/doctor" element={
        <PrivateRoute role="doctor">
          <DoctorDashboard />
        </PrivateRoute>
      } />
    </Routes>
  )
}