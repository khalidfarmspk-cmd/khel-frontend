import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import { asArray, matchesQuery } from '../format'
import page from '../page.module.css'
import styles from './MasterList.module.css'
import SkeletonTable from './SkeletonTable'

function emptyValues(fields) {
  const values = {}
  for (const field of fields) {
    values[field.key] = field.type === 'checkbox' ? false : ''
  }
  return values
}

function valuesFromRow(fields, row) {
  const values = {}
  for (const field of fields) {
    if (field.type === 'checkbox') {
      values[field.key] = Boolean(row[field.key])
    } else {
      values[field.key] = row[field.key] == null ? '' : String(row[field.key])
    }
  }
  return values
}

function buildBody(fields, values) {
  const body = {}
  for (const field of fields) {
    if (field.type === 'checkbox') {
      body[field.key] = Boolean(values[field.key])
      continue
    }
    const raw = String(values[field.key] ?? '').trim()
    if (field.type === 'number') {
      if (raw === '' || !/^-?\d+$/.test(raw)) return null
      const n = Number(raw)
      if (!Number.isInteger(n) || n < (field.min ?? 0)) return null
      body[field.key] = n
    } else {
      if (field.required !== false && raw === '') return null
      if (field.maxLength && raw.length > field.maxLength) return null
      body[field.key] = raw
    }
  }
  return body
}

export default function MasterList({
  title,
  crumb,
  path,
  idKey,
  columns,
  fields,
  addLabel = 'Add',
}) {
  const { token, isOwner } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => emptyValues(fields))
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await apiRequest(path, { token })
        if (!cancelled) setRows(asArray(data))
      } catch (err) {
        if (!cancelled) {
          setRows([])
          setError(err.message || `Could not load ${title.toLowerCase()}`)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [path, token, reloadKey, title])

  async function handleAdd(event) {
    event.preventDefault()
    const body = buildBody(fields, form)
    if (!body) {
      setFormError('Check the form. Required fields must be valid.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await apiRequest(path, { method: 'POST', token, body })
      setForm(emptyValues(fields))
      setReloadKey((key) => key + 1)
    } catch (err) {
      setFormError(err.message || 'Could not add row')
    } finally {
      setSaving(false)
    }
  }

  async function handleSave(id) {
    const body = buildBody(fields, editValues)
    if (!body) {
      setFormError('Check the form. Required fields must be valid.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await apiRequest(`${path}/${id}`, { method: 'PUT', token, body })
      setEditingId(null)
      setReloadKey((key) => key + 1)
    } catch (err) {
      setFormError(err.message || 'Could not save row')
    } finally {
      setSaving(false)
    }
  }

  function renderCell(column, row) {
    if (column.render) return column.render(row[column.key], row)
    const value = row[column.key]
    return value == null || value === '' ? '—' : value
  }

  const colSpan = columns.length + (isOwner ? 1 : 0)

  const filtered = useMemo(() => {
    return rows.filter((row) =>
      matchesQuery(
        search,
        columns.flatMap((column) => {
          const raw = row[column.key]
          const rendered = column.render ? column.render(raw, row) : raw
          return [raw, rendered]
        }),
      ),
    )
  }, [rows, search, columns])

  return (
    <div>
      <div className={page.crumb}>{crumb}</div>
      <div className={page.top}>
        <h1 className={page.title}>{title}</h1>
        <input
          className={`input ${page.search}`}
          type="search"
          placeholder="Search all fields"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isOwner ? (
        <form className={styles.addForm} onSubmit={handleAdd}>
          {fields.map((field) =>
            field.type === 'checkbox' ? (
              <label key={field.key} className={styles.checkField}>
                <input
                  type="checkbox"
                  checked={Boolean(form[field.key])}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]: e.target.checked,
                    }))
                  }
                />
                {field.label}
              </label>
            ) : (
              <label key={field.key} className={styles.field}>
                <span className="label">{field.label}</span>
                <input
                  className="input"
                  type={field.type === 'number' ? 'text' : 'text'}
                  inputMode={field.type === 'number' ? 'numeric' : undefined}
                  maxLength={field.maxLength}
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]: e.target.value,
                    }))
                  }
                />
              </label>
            ),
          )}
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving && editingId == null ? 'Adding…' : addLabel}
          </button>
        </form>
      ) : null}

      {formError ? <div className={`banner-error ${page.banner}`}>{formError}</div> : null}
      {error ? <div className={`banner-error ${page.banner}`}>{error}</div> : null}
      {loading ? (
        <SkeletonTable
          columns={columns.length}
          rows={6}
          hasActions={isOwner}
        />
      ) : null}

      {!loading && !error ? (
        <div className={page.card}>
          <table className={page.table}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {isOwner ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className={page.empty}>
                    {rows.length === 0
                      ? `No ${title.toLowerCase()} yet.`
                      : `No ${title.toLowerCase()} match your search.`}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const id = row[idKey]
                  const editing = editingId === id
                  return (
                    <tr key={row.uuid || id}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {editing && fields.some((field) => field.key === column.key) ? (
                            fields.find((field) => field.key === column.key).type ===
                            'checkbox' ? (
                              <input
                                type="checkbox"
                                checked={Boolean(editValues[column.key])}
                                onChange={(e) =>
                                  setEditValues((current) => ({
                                    ...current,
                                    [column.key]: e.target.checked,
                                  }))
                                }
                              />
                            ) : (
                              <input
                                className="input"
                                type="text"
                                inputMode={
                                  fields.find((field) => field.key === column.key)
                                    ?.type === 'number'
                                    ? 'numeric'
                                    : undefined
                                }
                                value={editValues[column.key] ?? ''}
                                onChange={(e) =>
                                  setEditValues((current) => ({
                                    ...current,
                                    [column.key]: e.target.value,
                                  }))
                                }
                              />
                            )
                          ) : (
                            renderCell(column, row)
                          )}
                        </td>
                      ))}
                      {isOwner ? (
                        <td>
                          {editing ? (
                            <div className={styles.rowActions}>
                              <button
                                className="btn-primary btn-small"
                                type="button"
                                disabled={saving}
                                onClick={() => handleSave(id)}
                              >
                                {saving ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                className="btn-secondary btn-small"
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                  setEditingId(null)
                                  setFormError('')
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn-secondary btn-small"
                              type="button"
                              onClick={() => {
                                setEditingId(id)
                                setEditValues(valuesFromRow(fields, row))
                                setFormError('')
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
