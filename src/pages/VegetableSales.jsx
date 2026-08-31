import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import KpiBar from '../components/KpiBar'
import {
  asArray,
  formatPrice,
  formatWeightKg,
  formatWhen,
  startOfMonth,
  startOfWeek,
  startOfYear,
  todayIso,
} from '../format'
import page from '../page.module.css'
import styles from './VegetableSales.module.css'

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
]

function rangeForTab(tabId, today) {
  switch (tabId) {
    case 'week':
      return { from: startOfWeek(today), to: today }
    case 'month':
      return { from: startOfMonth(today), to: today }
    case 'year':
      return { from: startOfYear(today), to: today }
    default:
      return { from: today, to: today }
  }
}

export default function VegetableSales() {
  const { token } = useAuth()
  const today = todayIso()
  const [tab, setTab] = useState('today')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [expenseDate, setExpenseDate] = useState(today)
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDescription, setExpenseDescription] = useState('Vegetables')
  const [expenseError, setExpenseError] = useState('')
  const [expenseSaving, setExpenseSaving] = useState(false)

  const range = useMemo(() => rangeForTab(tab, today), [tab, today])

  useEffect(() => {
    let cancelled = false
    const query = `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await apiRequest(`/api/reports/vegetable-sales?${query}`, { token })
        if (!cancelled) setReport(data)
      } catch (err) {
        if (!cancelled) {
          setReport(null)
          setError(err.message || 'Could not load vegetable sales')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [token, range.from, range.to, reloadKey])

  const items = asArray(report?.items)
  const revenue = Number(report?.revenue) || 0
  const expenses = Number(report?.expenses) || 0
  const profit = revenue - expenses

  async function handleAddExpense(event) {
    event.preventDefault()
    setExpenseError('')

    const jumlah = Number(String(expenseAmount).trim())
    if (!Number.isInteger(jumlah) || jumlah <= 0) {
      setExpenseError('Amount must be a positive whole number')
      return
    }

    const keterangan = expenseDescription.trim() || 'Vegetables'

    setExpenseSaving(true)
    try {
      await apiRequest('/api/expenses', {
        method: 'POST',
        token,
        body: {
          tanggal: expenseDate,
          jumlah,
          keterangan,
        },
      })
      setExpenseAmount('')
      setExpenseDescription('Vegetables')
      setReloadKey((key) => key + 1)
    } catch (err) {
      setExpenseError(err.message || 'Could not add expense')
    } finally {
      setExpenseSaving(false)
    }
  }

  return (
    <div>
      <div className={page.crumb}>Transactions / 08</div>
      <div className={page.top}>
        <h1 className={page.title}>Vegetable Sales</h1>
        <div className={styles.tabs}>
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? styles.tabActive : styles.tab}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className={`banner-error ${page.banner}`}>{error}</div> : null}
      {loading ? <p className="banner-info">Loading vegetable sales…</p> : null}

      {!loading && !error && report ? (
        <>
          <KpiBar
            items={[
              { label: 'Vegetable revenue', value: formatPrice(revenue) },
              { label: 'Total expenses', value: formatPrice(expenses) },
              { label: 'Vegetable profit', value: formatPrice(profit) },
            ]}
          />

          <section className={`${page.card} ${styles.tableCard}`}>
            <div className={page.cardHead}>Sales</div>
            <table className={page.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Weight (kg)</th>
                  <th>Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={page.empty}>
                      No vegetable sales in this period.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={`${item.date}-${item.product}-${index}`}>
                      <td>{formatWhen(item.date)}</td>
                      <td>{item.product}</td>
                      <td>{formatWeightKg(item.weight)}</td>
                      <td>{formatPrice(item.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className={`${page.card} ${styles.expenseCard}`}>
            <div className={page.cardHead}>Add daily vegetable expense</div>
            <form className={styles.expenseForm} onSubmit={handleAddExpense}>
              <label className={styles.expenseField}>
                <span className="label">Date</span>
                <input
                  className={`input ${page.dateInput}`}
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                />
              </label>
              <label className={styles.expenseField}>
                <span className="label">Amount</span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                />
              </label>
              <label className={styles.expenseField}>
                <span className="label">Description</span>
                <input
                  className="input"
                  maxLength={255}
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  required
                />
              </label>
              <button className="btn-primary" type="submit" disabled={expenseSaving}>
                {expenseSaving ? 'Adding…' : 'Add'}
              </button>
            </form>
            {expenseError ? (
              <div className={`banner-error ${styles.expenseError}`}>{expenseError}</div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  )
}
