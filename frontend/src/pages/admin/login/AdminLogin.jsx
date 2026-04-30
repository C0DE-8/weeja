import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../../../api/authApi'
import { clearSession, isAdminUser, setSession } from '../../../api/session'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const nextPath = location.state?.from || '/admin/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      })

      if (!isAdminUser(response.user)) {
        clearSession()
        setError('This account does not have admin access.')
        return
      }

      setSession({
        token: response.token,
        user: response.user,
      })

      navigate(nextPath, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Weeja Admin</p>
          <h1 className={styles.title}>Sign in to manage pools</h1>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.label} htmlFor="admin-email">
            Email address
          </label>
          <input
            id="admin-email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@weeja.com"
            autoComplete="email"
            disabled={loading}
          />

          <label className={styles.label} htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            className={styles.input}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={loading}
          />

          {error && <p className={styles.feedbackError}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Admin Login'}
          </button>
        </form>
      </section>
    </div>
  )
}
