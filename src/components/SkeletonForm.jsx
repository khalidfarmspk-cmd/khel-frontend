import Skeleton from './Skeleton'
import styles from './Skeleton.module.css'

export default function SkeletonForm({ fields = 3, hasButton = true, className = '' }) {
  return (
    <div
      className={`${styles.formRow} ${className}`.trim()}
      aria-busy="true"
      aria-label="Loading form"
    >
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className={styles.formField}>
          <Skeleton className={styles.fieldLabel} />
          <Skeleton className={styles.fieldInput} />
        </div>
      ))}
      {hasButton ? <Skeleton className={styles.formButton} /> : null}
    </div>
  )
}
