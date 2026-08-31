import Skeleton from './Skeleton'
import styles from './Skeleton.module.css'

export default function SkeletonChart({ bars = 12, className = '' }) {
  return (
    <div
      className={`${styles.chart} ${className}`.trim()}
      aria-busy="true"
      aria-label="Loading chart"
    >
      {Array.from({ length: bars }, (_, index) => (
        <div key={index} className={styles.bar}>
          <Skeleton
            className={styles.barFill}
            height={`${30 + ((index * 17) % 60)}%`}
          />
          <Skeleton className={styles.barLabel} />
        </div>
      ))}
    </div>
  )
}
