import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'
import { formatDate, formatRole } from '../format'
import styles from './Layout.module.css'

function itemClass({ isActive }) {
  return isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
}

export default function Layout() {
  const { username, levelUser, isOwner, logout } = useAuth()
  const today = formatDate(new Date())

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>PS</div>
          <div>
            <div className={styles.brandName}>Point of Sale</div>
            <div className={styles.brandPlace}>Lahore</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>Overview</div>
          <NavLink to="/" end className={itemClass}>
            <span className={styles.navIndex}>01</span>
            Dashboard
          </NavLink>

          <div className={styles.navGroup}>Master Data</div>
          <NavLink to="/products" className={itemClass}>
            <span className={styles.navIndex}>02</span>
            Products
          </NavLink>
          <NavLink to="/categories" className={itemClass}>
            <span className={styles.navIndex}>03</span>
            Categories
          </NavLink>
          <NavLink to="/suppliers" className={itemClass}>
            <span className={styles.navIndex}>04</span>
            Suppliers
          </NavLink>
          <NavLink to="/customers" className={itemClass}>
            <span className={styles.navIndex}>05</span>
            Customers
          </NavLink>
          <NavLink to="/units" className={itemClass}>
            <span className={styles.navIndex}>06</span>
            Units
          </NavLink>

          <div className={styles.navGroup}>Transactions</div>
          <NavLink to="/reports" className={itemClass}>
            <span className={styles.navIndex}>07</span>
            Reports
          </NavLink>
          <NavLink to="/vegetable-sales" className={itemClass}>
            <span className={styles.navIndex}>08</span>
            Vegetable Sales
          </NavLink>

          {isOwner ? (
            <>
              <div className={styles.navGroup}>Staff</div>
              <NavLink to="/users" className={itemClass}>
                <span className={styles.navIndex}>09</span>
                Users
              </NavLink>
            </>
          ) : null}
        </nav>

        <button type="button" className={styles.logout} onClick={logout}>
          <span className={styles.logoutDash} />
          Log out
        </button>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>Date</span>
            <span>{today}</span>
          </div>
          <div className={styles.headerDivider} />
          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>Signed in</span>
            <span>
              {username}
              {levelUser ? ` | ${formatRole(levelUser)}` : ''}
            </span>
          </div>
          <button type="button" className={styles.headerLogout} onClick={logout}>
            Log out
          </button>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
