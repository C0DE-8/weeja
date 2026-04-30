import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Login from './pages/auth/login/Login'
import Signup from './pages/auth/signup/Signup'
import AdminLogin from './pages/admin/login/AdminLogin'
import RequireAdminRoute from './components/auth/RequireAdminRoute'
import RequireSuperAdminRoute from './components/auth/RequireSuperAdminRoute'
import AdminLayout from './components/adminLayout/AdminLayout'
import AdminDashboard from './pages/admin/dashboard/AdminDashboard'
import AdminPools from './pages/admin/pools/AdminPools'
import AdminRegister from './pages/admin/register/AdminRegister'
import AdminPasskeys from './pages/admin/passkeys/AdminPasskeys'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route element={<RequireAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pools" element={<AdminPools />} />
            <Route element={<RequireSuperAdminRoute />}>
              <Route path="passkeys" element={<AdminPasskeys />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
