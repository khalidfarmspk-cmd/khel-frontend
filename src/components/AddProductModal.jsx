import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import { asArray } from '../format'
import styles from './AddProductModal.module.css'
import SkeletonForm from './SkeletonForm'

function categoryIdOf(row) {
  return row.categoryId ?? row.kategori_Id
}

function categoryNameOf(row) {
  return row.name ?? row.nama_kategori
}

function unitIdOf(row) {
  return row.satuan_Id ?? row.unitId
}

function unitNameOf(row) {
  return row.nama_satuan ?? row.name
}

function generateBarcode() {
  const first = '123456789'
  const rest = '0123456789'
  let code = first.charAt(Math.floor(Math.random() * first.length))
  for (let i = 0; i < 8; i++) {
    code += rest.charAt(Math.floor(Math.random() * rest.length))
  }
  return code
}

export default function AddProductModal({ onClose, onSaved }) {
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [barcode, setBarcode] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [stock, setStock] = useState('0')
  const [unitId, setUnitId] = useState('')
  const [categories, setCategories] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  useEffect(() => {
    let cancelled = false

    async function loadOptions() {
      setLoading(true)
      setLoadError('')
      try {
        const [categoryResult, unitResult] = await Promise.allSettled([
          apiRequest('/api/categories', { token }),
          apiRequest('/api/satuan', { token }).catch(() =>
            apiRequest('/api/units', { token }),
          ),
        ])
        if (cancelled) return

        const categoryData =
          categoryResult.status === 'fulfilled' ? categoryResult.value : null
        const unitData =
          unitResult.status === 'fulfilled' ? unitResult.value : null

        setCategories(asArray(categoryData))
        setUnits(asArray(unitData))

        const errors = []
        if (categoryResult.status === 'rejected') {
          errors.push(categoryResult.reason?.message || 'categories failed')
        }
        if (unitResult.status === 'rejected') {
          errors.push(unitResult.reason?.message || 'units failed')
        }
        if (errors.length) {
          setLoadError(`Could not load ${errors.join(' and ')}`)
        }
      } catch (err) {
        if (!cancelled) {
          setCategories([])
          setUnits([])
          setLoadError(err.message || 'Could not load categories and units')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadOptions()
    return () => {
      cancelled = true
    }
  }, [token])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const nama_produk = name.trim()
    const kode_produk = Number(barcode)
    const harga_beli = Number(buyPrice)
    const harga_jual = Number(sellPrice)
    const kategori_Id = Number(categoryId)
    const satuan_Id = Number(unitId)
    const stok_produk = stock === '' ? 0 : Number(stock)

    if (!nama_produk) {
      setError('Product name is required')
      return
    }
    if (!Number.isInteger(kode_produk) || kode_produk <= 0) {
      setError('Barcode must be a positive number')
      return
    }
    if (!Number.isInteger(harga_beli) || harga_beli < 0) {
      setError('Buy price must be 0 or greater')
      return
    }
    if (!Number.isInteger(harga_jual) || harga_jual < 0) {
      setError('Sell price must be 0 or greater')
      return
    }
    if (!Number.isInteger(kategori_Id) || kategori_Id <= 0) {
      setError('Choose a category')
      return
    }
    if (!Number.isInteger(satuan_Id) || satuan_Id <= 0) {
      setError('Choose a unit')
      return
    }
    if (!Number.isFinite(stok_produk) || stok_produk < 0) {
      setError('Stock must be 0 or greater')
      return
    }

    setSaving(true)
    try {
      await apiRequest('/api/products', {
        method: 'POST',
        token,
        body: {
          nama_produk,
          kode_produk,
          harga_beli,
          harga_jual,
          kategori_Id,
          stok_produk,
          satuan_Id,
        },
      })
      onSaved()
    } catch (err) {
      setError(err.message || 'Could not add product')
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
        <h2 className={styles.title}>Add product</h2>

        {loadError ? <div className="banner-error">{loadError}</div> : null}
        {error ? <div className="banner-error">{error}</div> : null}
        {saving ? <p className="banner-info">Saving…</p> : null}

        {loading ? (
          <SkeletonForm fields={6} />
        ) : (
          <>
        <label className={styles.field}>
          <span className="label">Product name</span>
          <input
            className="input"
            name="nama_produk"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="label">Barcode</span>
          <div className={styles.kodeRow}>
            <input
              className="input"
              name="kode_produk"
              type="number"
              min="1"
              step="1"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              required
            />
            <button
              className="btn-secondary"
              type="button"
              onClick={() => setBarcode(generateBarcode())}
              disabled={saving}
            >
              Fetch
            </button>
          </div>
        </label>

        <label className={styles.field}>
          <span className="label">Buy Price</span>
          <input
            className="input"
            name="harga_beli"
            type="number"
            min="0"
            step="1"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="label">Sell Price</span>
          <input
            className="input"
            name="harga_jual"
            type="number"
            min="0"
            step="1"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="label">Category</span>
          <select
            className="input"
            name="kategori_Id"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select category</option>
            {categories.map((row) => (
              <option key={categoryIdOf(row)} value={categoryIdOf(row)}>
                {categoryNameOf(row)}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className="label">Stock</span>
          <input
            className="input"
            name="stok_produk"
            type="number"
            min="0"
            step="any"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className="label">Unit</span>
          <select
            className="input"
            name="satuan_Id"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select unit</option>
            {units.map((row) => (
              <option key={unitIdOf(row)} value={unitIdOf(row)}>
                {unitNameOf(row)}
              </option>
            ))}
          </select>
        </label>
          </>
        )}

        <div className={styles.actions}>
          <button
            className="btn-secondary"
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            type="submit"
            disabled={
              saving ||
              loading ||
              categories.length === 0 ||
              units.length === 0
            }
          >
            {saving ? 'Saving…' : 'Add product'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
