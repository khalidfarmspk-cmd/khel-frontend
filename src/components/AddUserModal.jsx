import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import PasswordInput from './PasswordInput'
import styles from './AddProductModal.module.css'

const ROLES = [
  { value: 'KARYAWAN', label: 'Employee' },
  { value: 'PEMILIK', label: 'Owner' },
]

export default function AddUserModal({ onClose, onSaved }) {
  const { token } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('KARYAWAN')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const username_user = username.trim()
    if (!username_user) {
      setError('Username is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (!ROLES.some((option) => option.value === role)) {
      setError('Role must be Owner or Employee')
      return
    }

    setSaving(true)
    try {
      await apiRequest('/api/users', {
        method: 'POST',
        token,
        body: {
          username_user,
          password_user: password,
          role_user: role,
        },
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message || 'Could not create user')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div
      className={styles.overlay}
      onClick={() => {
        if (!saving) onClose()
      }}
    >      <form
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.title}>Add User</h2>

        {error ? <div className="banner-error">{error}</div> : null}

        <label className={styles.field}>
          <span className="label">Username</span>
          <input
            className="input"
            name="username_user"
            autoComplete="off"
            maxLength={30}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="label">Password</span>
          <PasswordInput
            name="password_user"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="label">Role</span>
          <select
            className="input"
            name="role_user"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            {ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.actions}>
          <button
            className="btn-secondary"
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
