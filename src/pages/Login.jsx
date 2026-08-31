import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'
import PasswordInput from '../components/PasswordInput'
import styles from './Login.module.css'

export default function Login() {
  const { token, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username.trim(), password)
    } catch (err) {
      setError(
        err.status === 401
          ? 'Invalid username or password'
          : err.message || 'Login failed',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.brandRow}>
          <div className={styles.logo}>PS</div>
          <div>
            <div className={styles.brandName}>Point of Sale</div>
            <div className={styles.brandPlace}>Lahore</div>
          </div>
        </div>

        <h1 className={styles.title}>Sign in</h1>

        {error ? <div className="banner-error">{error}</div> : null}
        {loading ? <p className="banner-info">Signing in…</p> : null}

        <label className={styles.field}>
          <span className="label">Username</span>
          <input
            className="input"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="label">Password</span>
          <PasswordInput
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
