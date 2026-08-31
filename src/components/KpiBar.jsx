import styles from './KpiBar.module.css'

export default function KpiBar({ items }) {
  return (
    <div className={styles.bar}>
      {items.map((item) => (
        <div key={item.label} className={styles.cell}>
          <div className={styles.label}>{item.label}</div>
          <div className={styles.value}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}
