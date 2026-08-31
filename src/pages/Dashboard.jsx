import { useEffect, useState } from 'react'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import KpiBar from '../components/KpiBar'
import { asArray, formatPrice, formatWhen, todayIso } from '../format'
import page from '../page.module.css'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { token } = useAuth()
  const [date, setDate] = useState(todayIso)

  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState('')

  const [sales, setSales] = useState([])
  const [salesLoading, setSalesLoading] = useState(true)
  const [salesError, setSalesError] = useState('')

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      setSummaryLoading(true)
      setSummaryError('')
      try {
        const data = await apiRequest(
          `/api/dashboard/summary?date=${encodeURIComponent(date)}`,
          { token },
        )
        if (!cancelled) setSummary(data)
      } catch (err) {
        if (!cancelled) {
          setSummary(null)
          setSummaryError(err.message || 'Could not load summary')
        }
      } finally {
        if (!cancelled) setSummaryLoading(false)
      }
    }

    loadSummary()
    return () => {
      cancelled = true
    }
  }, [token, date])

  useEffect(() => {
    let cancelled = false

    async function loadRecent() {
      setSalesLoading(true)
      setSalesError('')
      try {
        const data = await apiRequest('/api/dashboard/recent-sales?limit=10', {
          token,
        })
        if (!cancelled) setSales(asArray(data))
      } catch (err) {
        if (!cancelled) {
          setSales([])
          setSalesError(err.message || 'Could not load recent sales')
        }
      } finally {
        if (!cancelled) setSalesLoading(false)
      }
    }

    async function loadTop() {
      setProductsLoading(true)
      setProductsError('')
      try {
        const data = await apiRequest(
          '/api/dashboard/top-products?limit=5&days=7',
          { token },
        )
        if (!cancelled) setProducts(asArray(data))
      } catch (err) {
        if (!cancelled) {
          setProducts([])
          setProductsError(err.message || 'Could not load top products')
        }
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }

    loadRecent()
    loadTop()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div>
      <div className={page.crumb}>Overview / 01</div>
      <div className={page.top}>
        <h1 className={page.title}>Dashboard</h1>
        <label>
          <span className="label">Date</span>
          <input
            className={`input ${page.dateInput}`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>

      {summaryError ? (
        <div className={`banner-error ${page.banner}`}>{summaryError}</div>
      ) : null}
      {summaryLoading ? <p className="banner-info">Loading summary…</p> : null}
      {!summaryLoading && summary ? (
        <KpiBar
          items={[
            { label: 'Revenue today', value: formatPrice(summary.revenue) },
            { label: 'Transactions', value: summary.transactionCount ?? 0 },
            { label: 'Profit', value: formatPrice(summary.profit) },
            { label: 'Low stock', value: summary.lowStockCount ?? 0 },
          ]}
        />
      ) : null}

      <div className={styles.grid}>
        <section className={page.card}>
          <div className={page.cardHead}>Recent sales</div>
          {salesError ? (
            <div className={`banner-error ${styles.sectionBanner}`}>{salesError}</div>
          ) : null}
          {salesLoading ? (
            <p className={`banner-info ${styles.sectionBanner}`}>Loading sales…</p>
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
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={page.empty}>
                      No recent sales.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.saleId}>
                      <td>{sale.saleId}</td>
                      <td>{formatWhen(sale.saleDate)}</td>
                      <td>{sale.cashierName}</td>
                      <td>{formatPrice(sale.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}
        </section>

        <section className={page.card}>
          <div className={page.cardHead}>Top products</div>
          {productsError ? (
            <div className={`banner-error ${styles.sectionBanner}`}>
              {productsError}
            </div>
          ) : null}
          {productsLoading ? (
            <p className={`banner-info ${styles.sectionBanner}`}>
              Loading products…
            </p>
          ) : null}
          {!productsLoading && !productsError ? (
            <table className={page.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={page.empty}>
                      No products sold in the last 7 days.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.productCode || product.name}>
                      <td>{product.name}</td>
                      <td>{product.qty}</td>
                      <td>{formatPrice(product.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}
        </section>
      </div>
    </div>
  )
}
