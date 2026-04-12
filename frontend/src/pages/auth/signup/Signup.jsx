import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../../components/header/Header'
import Footer from '../../../components/footer/Footer'
import { registerUser, verifyOtp, resendOtp } from '../../../api/authApi'
import styles from './Signup.module.css'

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState('form')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }

    setLoading(true)
    try {
      await registerUser({
        name: username.trim(),
        email: email.trim(),
        password,
      })
      setPendingEmail(email.trim().toLowerCase())
      setOtp('')
      setStep('otp')
      setSuccess('Check your email for a 6-digit verification code.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!otp.trim() || otp.length !== 6) {
      setError('Enter the 6-digit code from your email.')
      return
    }

    setLoading(true)
    try {
      await verifyOtp({ email: pendingEmail, otp: otp.trim() })
      navigate('/login', {
        state: {
          verifiedMessage: 'Email verified. You can log in.',
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setSuccess('')
    setResendLoading(true)
    try {
      await resendOtp({ email: pendingEmail })
      setSuccess('If an account needs verification, a new code has been sent.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.card}>
          {step === 'form' ? (
            <>
              <h1 className={styles.title}>Sign Up</h1>
              <form className={styles.form} onSubmit={handleRegister} noValidate>
                <label className={styles.label} htmlFor="username">
                  Dummy user name
                </label>
                <input
                  id="username"
                  type="text"
                  className={styles.input}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Eg fishbowl"
                  autoComplete="name"
                  disabled={loading}
                />

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

                <label className={styles.label} htmlFor="phone">
                  Mobile Number
                </label>
                <div className={styles.phoneGroup}>
                  <div className={styles.countryCode}>
                    <span className={styles.flag}>🇳🇬</span>
                    <span className={styles.countryText}>+234</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    className={styles.phoneInput}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="810 0000 0000"
                    autoComplete="tel"
                    disabled={loading}
                  />
                </div>

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
                    placeholder="************"
                    autoComplete="new-password"
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

                {error && <p className={styles.feedbackError}>{error}</p>}
                {success && <p className={styles.feedbackSuccess}>{success}</p>}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Sign Up'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Verify email</h1>
              <p className={styles.otpHint}>
                Enter the 6-digit code sent to{' '}
                <span className={styles.otpEmail}>{pendingEmail}</span>
              </p>
              <form className={styles.form} onSubmit={handleVerifyOtp} noValidate>
                <label className={styles.label} htmlFor="otp">
                  Verification code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className={`${styles.input} ${styles.otpInput}`}
                  value={otp}
                  onChange={(event) => {
                    const next = event.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(next)
                  }}
                  placeholder="000000"
                  disabled={loading}
                />

                {error && <p className={styles.feedbackError}>{error}</p>}
                {success && <p className={styles.feedbackSuccess}>{success}</p>}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Verifying…' : 'Verify & continue'}
                </button>

                <button
                  type="button"
                  className={styles.resendButton}
                  onClick={handleResendOtp}
                  disabled={loading || resendLoading}
                >
                  {resendLoading ? 'Sending…' : 'Resend code'}
                </button>

                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => {
                    setStep('form')
                    setError('')
                    setSuccess('')
                    setOtp('')
                  }}
                  disabled={loading || resendLoading}
                >
                  Back to sign up
                </button>
              </form>
            </>
          )}

          <p className={styles.termsText}>
            By signing up, you have agreed to Weeja{' '}
            <span className={styles.linkText}>terms and conditions</span>
          </p>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.linkText}>
              Login
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
