import Skeleton from './Skeleton'
import page from '../page.module.css'
import styles from './Skeleton.module.css'

function cellClass(index, total) {
  if (index === 0) return styles.cellNarrow
  if (index === total - 1) return styles.cellNarrow
  return styles.cellWide
}

export default function SkeletonTable({
  columns = 4,
  rows = 6,
  hasActions = false,
  inCard = true,
  className = '',
}) {
  const colCount = columns + (hasActions ? 1 : 0)
  const table = (
    <div className={styles.tableWrap}>
      <table className={`${page.table} ${styles.table}`}>
        <thead>
          <tr>
            {Array.from({ length: colCount }, (_, index) => (
              <th key={index}>
                <Skeleton className={styles.cell} height={10} width="60%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: colCount }, (_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton
                    className={cellClass(colIndex, colCount)}
                    height={14}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (!inCard) {
    return (
      <div className={className} aria-busy="true" aria-label="Loading table">
        {table}
      </div>
    )
  }

  return (
    <div
      className={`${page.card} ${className}`.trim()}
      aria-busy="true"
      aria-label="Loading table"
    >
      {table}
    </div>
  )
}
