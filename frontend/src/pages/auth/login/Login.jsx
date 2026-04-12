import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Header from '../../../components/header/Header'
import Footer from '../../../components/footer/Footer'
import { loginUser } from '../../../api/authApi'
import { TOKEN_STORAGE_KEY } from '../../../api/axios'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const msg = location.state?.verifiedMessage
    if (msg) {
      setSuccess(msg)
      navigate('/login', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      const res = await loginUser({
        email: email.trim(),
        password,
      })
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.card}>
          <h1 className={styles.title}>Login</h1>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.label} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              disabled={loading}
            />

            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.passwordGroup}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={styles.toggleButton}
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              type="button"
              className={styles.forgotLink}
              onClick={() => console.log('Forgot password clicked')}
              disabled={loading}
            >
              Forgot Password?
            </button>

            {error && <p className={styles.feedbackError}>{error}</p>}
            {success && <p className={styles.feedbackSuccess}>{success}</p>}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className={styles.footerText}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className={styles.linkText}>
              Sign Up
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
