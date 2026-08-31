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

const STATUSES = [
  { value: 'AKTIF', label: 'Active' },
  { value: 'NONAKTIF', label: 'Inactive' },
]

function normalizeRole(value) {
  const key = String(value ?? '').toUpperCase()
  return ROLES.some((option) => option.value === key) ? key : 'KARYAWAN'
}

function normalizeStatus(value) {
  const key = String(value ?? '').toUpperCase()
  return STATUSES.some((option) => option.value === key) ? key : 'AKTIF'
}

export default function EditUserModal({ user, onClose, onSaved }) {
  const { token } = useAuth()
  const [username, setUsername] = useState(user.username ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(() => normalizeRole(user.role))
  const [status, setStatus] = useState(() => normalizeStatus(user.status))
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
    if (!ROLES.some((option) => option.value === role)) {
      setError('Role must be Owner or Employee')
      return
    }
    if (!STATUSES.some((option) => option.value === status)) {
      setError('Status must be Active or Inactive')
      return
    }

    const body = {
      username_user,
      role_user: role,
      status_user: status,
    }
    const nextPassword = password.trim()
    if (nextPassword) {
      body.password_user = nextPassword
    }

    setSaving(true)
    try {
      await apiRequest(`/api/users/${encodeURIComponent(user.userId)}`, {
        method: 'PUT',
        token,
        body,
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message || 'Could not update user')
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
    >
      <form
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.title}>Edit User</h2>

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
            placeholder="Leave blank to keep current"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-lpignore="true"
            data-1p-ignore="true"
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

        <label className={styles.field}>
          <span className="label">Status</span>
          <select
            className="input"
            name="status_user"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            {STATUSES.map((option) => (
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
