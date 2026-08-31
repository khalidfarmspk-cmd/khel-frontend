import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import KpiBar from '../components/KpiBar'
import {
  asArray,
  formatPrice,
  formatWhen,
  matchesQuery,
  startOfMonth,
  startOfWeek,
  todayIso,
} from '../format'
import page from '../page.module.css'
import styles from './Reports.module.css'

export default function Reports() {
  const { token } = useAuth()
  const today = todayIso()
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)

  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(true)
  const [reportError, setReportError] = useState('')

  const [sales, setSales] = useState([])
  const [salesLoading, setSalesLoading] = useState(true)
  const [salesError, setSalesError] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [lines, setLines] = useState([])
  const [linesLoading, setLinesLoading] = useState(false)
  const [linesError, setLinesError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    const query = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`

    async function loadReport() {
      setReportLoading(true)
      setReportError('')
      try {
        const data = await apiRequest(`/api/reports/sales?${query}`, { token })
        if (!cancelled) setReport(data)
      } catch (err) {
        if (!cancelled) {
          setReport(null)
          setReportError(err.message || 'Could not load report')
        }
      } finally {
        if (!cancelled) setReportLoading(false)
      }
    }

    async function loadSales() {
      setSalesLoading(true)
      setSalesError('')
      setSelectedId(null)
      setLines([])
      setLinesError('')
      try {
        const data = await apiRequest(`/api/sales?${query}`, { token })
        if (!cancelled) setSales(asArray(data))
      } catch (err) {
        if (!cancelled) {
          setSales([])
          setSalesError(err.message || 'Could not load transactions')
        }
      } finally {
        if (!cancelled) setSalesLoading(false)
      }
    }

    loadReport()
    loadSales()
    return () => {
      cancelled = true
    }
  }, [token, from, to])

  async function openSale(saleId) {
    setSelectedId(saleId)
    setLinesLoading(true)
    setLinesError('')
    try {
      const data = await apiRequest(`/api/reports/sales/${saleId}/lines`, {
        token,
      })
      setLines(asArray(data))
    } catch (err) {
      setLines([])
      setLinesError(err.message || 'Could not load line items')
    } finally {
      setLinesLoading(false)
    }
  }

  const filteredSales = useMemo(() => {
    return sales.filter((sale) =>
      matchesQuery(search, [
        sale.saleId,
        sale.saleDate,
        formatWhen(sale.saleDate),
        sale.cashierName,
        sale.totalPayment,
        formatPrice(sale.totalPayment),
      ]),
    )
  }, [sales, search])

  const byDay = asArray(report?.byDay)
  const maxRevenue = Math.max(0, ...byDay.map((day) => Number(day.revenue) || 0))

  return (
    <div>
      <div className={page.crumb}>Transactions / 07</div>
      <div className={page.top}>
        <h1 className={page.title}>Reports</h1>
        <div className={page.filters}>
          <label>
            <span className="label">From</span>
            <input
              className={`input ${page.dateInput}`}
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            <span className="label">To</span>
            <input
              className={`input ${page.dateInput}`}
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setFrom(today)
              setTo(today)
            }}
          >
            Today
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setFrom(startOfWeek(today))
              setTo(today)
            }}
          >
            This week
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setFrom(startOfMonth(today))
              setTo(today)
            }}
          >
            This month
          </button>
        </div>
      </div>

      {reportError ? (
        <div className={`banner-error ${page.banner}`}>{reportError}</div>
      ) : null}
      {reportLoading ? <p className="banner-info">Loading report…</p> : null}
      {!reportLoading && report ? (
        <KpiBar
          items={[
            { label: 'Revenue', value: formatPrice(report.totalRevenue) },
            { label: 'Transactions', value: report.transactionCount ?? 0 },
            { label: 'Profit', value: formatPrice(report.totalProfit) },
            { label: 'Average basket', value: formatPrice(report.avgBasket) },
          ]}
        />
      ) : null}

      {!reportLoading && report ? (
        <section className={`${page.card} ${styles.chartCard}`}>
          <div className={page.cardHead}>Revenue by day</div>
          {byDay.length === 0 ? (
            <p className={`banner-info ${styles.pad}`}>No revenue in this range.</p>
          ) : (
            <div className={styles.chart}>
              {byDay.map((day) => {
                const value = Number(day.revenue) || 0
                const height = maxRevenue === 0 ? 0 : (value / maxRevenue) * 100
                return (
                  <div key={day.date} className={styles.barCol} title={formatPrice(value)}>
                    <div
                      className={styles.bar}
                      style={{ height: `${height}%` }}
                    />
                    <div className={styles.barLabel}>
                      {String(day.date).slice(5, 10)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      ) : null}

      <section className={`${page.card} ${styles.tableCard}`}>
        <div className={styles.tableHead}>
          <div className={page.cardHead}>Transactions</div>
          <input
            className={`input ${page.search}`}
            type="search"
            placeholder="Search all fields"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {salesError ? (
          <div className={`banner-error ${styles.pad}`}>{salesError}</div>
        ) : null}
        {salesLoading ? (
          <p className={`banner-info ${styles.pad}`}>Loading transactions…</p>
        ) : null}
        {!salesLoading && !salesError ? (
          <table className={page.table}>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Time</th>
                <th>Cashier</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={4} className={page.empty}>
                    {sales.length === 0
                      ? 'No transactions in this range.'
                      : 'No transactions match your search.'}
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.saleId}
                    className={`${styles.clickable} ${
                      selectedId === sale.saleId ? styles.selected : ''
                    }`}
                    onClick={() => openSale(sale.saleId)}
                  >
                    <td>{sale.saleId}</td>
                    <td>{formatWhen(sale.saleDate)}</td>
                    <td>{sale.cashierName}</td>
                    <td>{formatPrice(sale.totalPayment)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : null}
      </section>

      {selectedId != null ? (
        <section className={`${page.card} ${styles.tableCard}`}>
          <div className={page.cardHead}>Line items — ticket {selectedId}</div>
          {linesError ? (
            <div className={`banner-error ${styles.pad}`}>{linesError}</div>
          ) : null}
          {linesLoading ? (
            <p className={`banner-info ${styles.pad}`}>Loading line items…</p>
          ) : null}
          {!linesLoading && !linesError ? (
            <table className={page.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={page.empty}>
                      No line items.
                    </td>
                  </tr>
                ) : (
                  lines.map((line, index) => (
                    <tr key={`${line.name}-${index}`}>
                      <td>{line.name}</td>
                      <td>{line.qty}</td>
                      <td>{line.unit}</td>
                      <td>{formatPrice(line.subtotal)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
