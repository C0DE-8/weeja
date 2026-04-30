import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Login from './pages/auth/login/Login'
import Signup from './pages/auth/signup/Signup'
import AdminLogin from './pages/admin/login/AdminLogin'
import RequireAuthRoute from './components/auth/RequireAuthRoute'
import RequireAdminRoute from './components/auth/RequireAdminRoute'
import RequireSuperAdminRoute from './components/auth/RequireSuperAdminRoute'
import AdminLayout from './components/adminLayout/AdminLayout'
import AdminDashboard from './pages/admin/dashboard/AdminDashboard'
import AdminPools from './pages/admin/pools/AdminPools'
import AdminRegister from './pages/admin/register/AdminRegister'
import AdminPasskeys from './pages/admin/passkeys/AdminPasskeys'
import AdminPoolSubmissions from './pages/admin/poolSubmissions/AdminPoolSubmissions'
import AccountDashboard from './pages/account/AccountDashboard'
import AccountWallets from './pages/account/AccountWallets'
import AccountCreate from './pages/account/AccountCreate'
import PoolResultsPage from './pages/results/PoolResultsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<PoolResultsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<RequireAuthRoute />}>
          <Route path="/account" element={<AccountDashboard />} />
          <Route path="/wallet" element={<AccountWallets />} />
          <Route path="/create" element={<AccountCreate />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route element={<RequireAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pools" element={<Navigate to="/admin/pools/create" replace />} />
            <Route path="pools/create" element={<AdminPools view="create" />} />
            <Route path="pools/existing" element={<AdminPools view="existing" />} />
            <Route path="pools/submissions" element={<AdminPoolSubmissions />} />
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
