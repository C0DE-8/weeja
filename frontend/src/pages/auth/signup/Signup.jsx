import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../../components/header/Header'
import Footer from '../../../components/footer/Footer'
import styles from './Signup.module.css'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }

    console.log('Signup data:', { username, email, phone, password })
    setSuccess('Signup submitted successfully.')
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.card}>
          <h1 className={styles.title}>Sign Up</h1>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={styles.toggleButton}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {error && <p className={styles.feedbackError}>{error}</p>}
            {success && <p className={styles.feedbackSuccess}>{success}</p>}

            <button type="submit" className={styles.submitButton}>
              Sign Up
            </button>
          </form>

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
