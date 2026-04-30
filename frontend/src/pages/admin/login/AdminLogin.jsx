import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../../../api/authApi'
import { clearSession, isAdminUser, setSession } from '../../../api/session'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const nextPath = location.state?.from || '/admin/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!identifier.trim() || !password.trim()) {
      setError('Username/email and password are required.')
      return
    }

    setLoading(true)

    try {
      const response = await loginUser({
        identifier: identifier.trim(),
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
          <label className={styles.label} htmlFor="admin-identifier">
            Username or email
          </label>
          <input
            id="admin-identifier"
            className={styles.input}
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="superadmin or admin@weeja.com"
            autoComplete="username"
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
