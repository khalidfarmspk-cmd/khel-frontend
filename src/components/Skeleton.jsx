import styles from './Skeleton.module.css'

export default function Skeleton({
  className = '',
  width,
  height,
  circle = false,
  style = {},
}) {
  const merged = {
    ...style,
    ...(width != null ? { width } : {}),
    ...(height != null ? { height } : {}),
  }

  return (
    <span
      className={`${styles.bone} ${circle ? styles.circle : ''} ${className}`.trim()}
      style={merged}
      aria-hidden="true"
    />
  )
}
