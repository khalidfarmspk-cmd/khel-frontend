import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import { formatPrice, matchesQuery } from '../format'
import EditPriceModal from '../components/EditPriceModal'
import AddProductModal from '../components/AddProductModal'
import styles from './Products.module.css'

export default function Products() {
  const { token, isOwner } = useAuth()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await apiRequest('/api/products', { token })
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setProducts([])
          setError(err.message || 'Could not load products')
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
    return products.filter((product) =>
      matchesQuery(search, [
        product.productCode,
        product.name,
        product.category,
        product.unit,
        product.supplier,
        product.buyPrice,
        product.sellPrice,
        formatPrice(product.buyPrice),
        formatPrice(product.sellPrice),
        product.stock,
      ]),
    )
  }, [products, search])

  return (
    <div>
      <div className={styles.crumb}>Master Data / 02</div>

      <div className={styles.top}>
        <h1 className={styles.title}>Products</h1>
        <div className={styles.topActions}>
          <input
            className={`input ${styles.search}`}
            type="search"
            placeholder="Search all fields"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isOwner ? (
            <button
              className="btn-primary"
              type="button"
              onClick={() => setAdding(true)}
            >
              Add Product
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className={`banner-error ${styles.banner}`}>{error}</div> : null}
      {loading ? <p className="banner-info">Loading products…</p> : null}

      {!loading && !error ? (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Buy price</th>
                <th>Sell price</th>
                <th>Stock</th>
                {isOwner ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isOwner ? 8 : 7} className={styles.empty}>
                    {products.length === 0
                      ? 'No products yet.'
                      : 'No products match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.uuid || product.productCode}>
                    <td>{product.productCode}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.unit}</td>
                    <td>{formatPrice(product.buyPrice)}</td>
                    <td>{formatPrice(product.sellPrice)}</td>
                    <td>{product.stock}</td>
                    {isOwner ? (
                      <td>
                        <button
                          className="btn-secondary btn-small"
                          type="button"
                          onClick={() => setEditing(product)}
                        >
                          Edit
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {adding ? (
        <AddProductModal
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false)
            setReloadKey((key) => key + 1)
          }}
        />
      ) : null}

      {editing ? (
        <EditPriceModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            setReloadKey((key) => key + 1)
          }}
        />
      ) : null}
    </div>
  )
}
