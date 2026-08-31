export function formatPrice(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `Rs. ${n.toLocaleString('en-US')}`
}

export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayIso() {
  return formatDate(new Date())
}

export function startOfWeek(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = date.getDay()
  const diff = weekday === 0 ? 6 : weekday - 1
  date.setDate(date.getDate() - diff)
  return formatDate(date)
}

export function startOfMonth(isoDate) {
  return `${isoDate.slice(0, 7)}-01`
}

export function startOfYear(isoDate) {
  return `${isoDate.slice(0, 4)}-01-01`
}

export function formatWeightKg(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 3 })} kg`
}

export function asArray(data) {
  if (Array.isArray(data)) return data
  return []
}

export function matchesQuery(query, values) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(q))
}

export function formatWhen(value) {
  if (value == null || value === '') return '—'
  const str = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  const date = new Date(str)
  if (Number.isNaN(date.getTime())) return str
  return formatDate(date)
}

const ROLE_LABELS = {
  PEMILIK: 'Owner',
  KARYAWAN: 'Employee',
}

const STATUS_LABELS = {
  AKTIF: 'Active',
  NONAKTIF: 'Inactive',
  SUSPEND: 'Suspended',
}

export function formatRole(value) {
  if (value == null || value === '') return '—'
  const key = String(value).toUpperCase()
  return ROLE_LABELS[key] || String(value)
}

export function formatStatus(value) {
  if (value == null || value === '') return '—'
  const key = String(value).toUpperCase()
  return STATUS_LABELS[key] || String(value)
}
