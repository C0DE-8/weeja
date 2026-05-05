import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../../components/header/Header'
import Footer from '../../../components/footer/Footer'
import AuthStatusCard from '../../../components/auth/AuthStatusCard'
import { verifyEmailLink } from '../../../api/authApi'
import styles from './VerifyEmail.module.css'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('Verifying your email address...')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('This verification link is missing or invalid.')
      return
    }

    let isMounted = true

    async function verify() {
      try {
        const response = await verifyEmailLink({ token })
        if (!isMounted) {
          return
        }
        setStatus('success')
        setMessage(response.message || 'Email verified successfully.')
      } catch (err) {
        if (!isMounted) {
          return
        }
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed.')
      }
    }

    verify()

    return () => {
      isMounted = false
    }
  }, [searchParams])

  const isSuccess = status === 'success'

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <AuthStatusCard
          icon={isSuccess ? 'success' : 'mail'}
          title={isSuccess ? 'Email Address Verified Successfully!' : 'Verify Email Address'}
          description={message}
          primaryAction={{
            label: isSuccess ? 'Continue to Login' : 'Back to Sign Up',
            onClick: () =>
              navigate(isSuccess ? '/login' : '/signup', {
                state: isSuccess
                  ? { verifiedMessage: 'Email verified. You can log in.' }
                  : undefined,
              }),
          }}
        />
      </main>
      <Footer />
    </div>
  )
}
