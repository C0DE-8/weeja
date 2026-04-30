import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Login from './pages/auth/login/Login'
import Signup from './pages/auth/signup/Signup'
import AdminLogin from './pages/admin/login/AdminLogin'
import RequireAdminRoute from './components/auth/RequireAdminRoute'
import AdminLayout from './components/adminLayout/AdminLayout'
import AdminDashboard from './pages/admin/dashboard/AdminDashboard'
import AdminPools from './pages/admin/pools/AdminPools'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<RequireAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pools" element={<AdminPools />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
