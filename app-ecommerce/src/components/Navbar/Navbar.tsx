import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'
import logo from '../../assets/LogoNaranga.png'
import {UilSun, UilMoon} from '@iconscout/react-unicons'


type NavbarProps = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  return (
    <header className={styles.navbar}>

      <Link to="/" className={styles.brand}>
        <img src={logo} alt="Logo" className={styles.logo} />
        MarketByte
      </Link>

      <nav className={styles.links}>
        <Link to="/" className={styles.navLink}>
          Catálogo
        </Link>
      </nav>

      {/* Botón de tema - desktop */}
      <button
        className={styles.themeBtn}
        onClick={onToggleTheme}
        aria-label="Cambiar tema"
      >
        {theme === 'light' ? <UilSun /> : <UilMoon />}
      </button>

    </header>
  )
}