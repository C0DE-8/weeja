import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../../components/header/Header'
import Footer from '../../../components/footer/Footer'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    console.log('Login data:', { email, password })
    setSuccess('Login submitted successfully.')
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
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={styles.toggleButton}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              type="button"
              className={styles.forgotLink}
              onClick={() => console.log('Forgot password clicked')}
            >
              Forgot Password?
            </button>

            {error && <p className={styles.feedbackError}>{error}</p>}
            {success && <p className={styles.feedbackSuccess}>{success}</p>}

            <button type="submit" className={styles.submitButton}>
              Login
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
