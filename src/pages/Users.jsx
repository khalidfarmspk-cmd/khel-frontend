import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import { asArray, formatRole, formatStatus, matchesQuery } from '../format'
import AddUserModal from '../components/AddUserModal'
import EditUserModal from '../components/EditUserModal'
import SkeletonTable from '../components/SkeletonTable'
import page from '../page.module.css'

export default function Users() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await apiRequest('/api/users', { token })
        if (!cancelled) setUsers(asArray(data))
      } catch (err) {
        if (!cancelled) {
          setUsers([])
          setError(err.message || 'Could not load users')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [token, reloadKey])

  const filtered = useMemo(() => {
    return users.filter((user) =>
      matchesQuery(search, [
        user.userId,
        user.name,
        user.username,
        user.role,
        formatRole(user.role),
        user.status,
        formatStatus(user.status),
        user.address,
        user.phone,
      ]),
    )
  }, [users, search])

  function refresh() {
    setReloadKey((key) => key + 1)
  }

  async function handleDelete(user) {
    const ok = window.confirm(
      `Delete ${user.username}? This also removes the account from the shop till.`,
    )
    if (!ok) return

    setDeletingId(user.userId)
    setError('')
    try {
      await apiRequest(`/api/users/${user.userId}`, { method: 'DELETE', token })
      refresh()
    } catch (err) {
      setError(err.message || 'Could not delete user')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className={page.crumb}>Staff / 09</div>
      <div className={page.top}>
        <h1 className={page.title}>Users</h1>
        <div className={page.topActions}>
          <input
            className={`input ${page.search}`}
            type="search"
            placeholder="Search all fields"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn-primary"
            type="button"
            onClick={() => setAdding(true)}
          >
            Add User
          </button>
        </div>
      </div>

      {error ? <div className={`banner-error ${page.banner}`}>{error}</div> : null}
      {loading ? (
        <SkeletonTable columns={4} rows={5} hasActions />
      ) : null}

      {!loading && !error ? (
        <div className={page.card}>
          <table className={page.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={page.empty}>
                    {users.length === 0
                      ? 'No users found.'
                      : 'No users match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{formatRole(user.role)}</td>
                    <td>{formatStatus(user.status)}</td>
                    <td>
                      <button
                        className="btn-secondary btn-small"
                        type="button"
                        onClick={() => setEditing(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary btn-small"
                        type="button"
                        disabled={deletingId === user.userId}
                        onClick={() => handleDelete(user)}
                      >
                        {deletingId === user.userId ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {adding ? (
        <AddUserModal
          onClose={() => setAdding(false)}
          onSaved={refresh}
        />
      ) : null}

      {editing ? (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      ) : null}
    </div>
  )
}
