import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import styles from './EditPriceModal.module.css'

function parseNonNegativeInt(value) {
  const trimmed = String(value).trim()
  if (trimmed === '') return null
  if (!/^[0-9]+$/.test(trimmed)) return false
  const n = Number(trimmed)
  if (!Number.isInteger(n) || n < 0) return false
  return n
}

export default function EditPriceModal({ product, onClose, onSaved }) {
  const { token } = useAuth()
  const [buyPrice, setBuyPrice] = useState(String(product.buyPrice ?? ''))
  const [sellPrice, setSellPrice] = useState(String(product.sellPrice ?? ''))
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

    const buy = parseNonNegativeInt(buyPrice)
    const sell = parseNonNegativeInt(sellPrice)

    if (buy === false || sell === false) {
      setError('Prices must be whole numbers 0 or greater')
      return
    }

    if (buy === null || sell === null) {
      setError('Buy price and sell price are required (0 is allowed)')
      return
    }

    setSaving(true)
    try {
      await apiRequest(`/api/products/${encodeURIComponent(product.productCode)}`, {
        method: 'PUT',
        token,
        body: {
          buyPrice: buy,
          sellPrice: sell,
        },
      })
      onSaved()
    } catch (err) {
      setError(err.message || 'Could not save prices')
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
        <h2 className={styles.title}>Edit prices</h2>
        <p className={styles.meta}>
          {product.productCode} — {product.name}
        </p>

        {error ? <div className="banner-error">{error}</div> : null}
        {saving ? <p className="banner-info">Saving…</p> : null}

        <label className={styles.field}>
          <span className="label">Buy price</span>
          <input
            className="input"
            inputMode="numeric"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className="label">Sell price</span>
          <input
            className="input"
            inputMode="numeric"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
          />
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
