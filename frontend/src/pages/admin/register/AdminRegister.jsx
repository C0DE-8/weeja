import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerAdmin } from '../../../api/authApi'
import styles from './AdminRegister.module.css'

export default function AdminRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    passkey: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.username.trim() || !form.email.trim() || !form.passkey.trim() || !form.password.trim()) {
      setError('Username, email, passkey, and password are required.')
      return
    }

    setLoading(true)

    try {
      await registerAdmin({
        username: form.username.trim(),
        email: form.email.trim(),
        passkey: form.passkey.trim(),
        password: form.password,
      })

      setSuccess('Admin account created. You can sign in now.')
      setTimeout(() => {
        navigate('/admin/login')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register admin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Admin Access</p>
          <h1 className={styles.title}>Register an admin account</h1>
          <p className={styles.subtitle}>
            Use a passkey created by the super admin to create a new admin account.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.label} htmlFor="admin-register-username">
            Username
          </label>
          <input
            id="admin-register-username"
            className={styles.input}
            type="text"
            value={form.username}
            onChange={handleChange('username')}
            placeholder="adminname"
            autoComplete="username"
            disabled={loading}
          />

          <label className={styles.label} htmlFor="admin-register-email">
            Email
          </label>
          <input
            id="admin-register-email"
            className={styles.input}
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="admin@weeja.com"
            autoComplete="email"
            disabled={loading}
          />

          <label className={styles.label} htmlFor="admin-register-passkey">
            Passkey
          </label>
          <input
            id="admin-register-passkey"
            className={styles.input}
            type="text"
            value={form.passkey}
            onChange={handleChange('passkey')}
            placeholder="Enter the passkey from super admin"
            disabled={loading}
          />

          <label className={styles.label} htmlFor="admin-register-password">
            Password
          </label>
          <input
            id="admin-register-password"
            className={styles.input}
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Create password"
            autoComplete="new-password"
            disabled={loading}
          />

          {error && <p className={styles.feedbackError}>{error}</p>}
          {success && <p className={styles.feedbackSuccess}>{success}</p>}

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register Admin'}
          </button>

          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link className={styles.linkText} to="/admin/login">
              Admin login
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
