import Skeleton from './Skeleton'
import styles from './Skeleton.module.css'

export default function SkeletonKpiBar({ count = 4 }) {
  return (
    <div
      className={styles.kpiBar}
      style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
      aria-busy="true"
      aria-label="Loading summary"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.kpiCell}>
          <Skeleton className={styles.kpiLabel} />
          <Skeleton className={styles.kpiValue} />
        </div>
      ))}
    </div>
  )
}
