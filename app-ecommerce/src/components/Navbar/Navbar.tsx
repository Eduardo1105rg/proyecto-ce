import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'
import logo from '../../assets/LogoNaranga.png'
import { UilSun, UilMoon, UilEstate, UilStore, UilShoppingCart } from '@iconscout/react-unicons'

type NavbarProps = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  // Función para manejar clics en enlaces deshabilitados
  const handleDisabledClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Página en desarrollo')
  }

  return (
    <>
      {/* Navbar superior */}
      <header className={styles.navbar}>
        <Link to="/" className={styles.brand}>
          <img src={logo} alt="Logo" className={styles.logo} />
          MarketByte
        </Link>

        {/* Links desktop */}
        <nav className={styles.links}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''} ${styles.navLinkDisabled}`}
            onClick={handleDisabledClick}
            aria-disabled="true"
            tabIndex={-1}
          >
            Home
          </Link>
          {/* <Link 
            to="/catalogo" 
            className={`${styles.navLink} ${isActive('/catalogo') ? styles.navLinkActive : ''}`}
          >
            Catálogo
          </Link> */}
          {/* <Link 
            to="/carrito" 
            className={`${styles.navLink} ${isActive('/carrito') ? styles.navLinkActive : ''} ${styles.navLinkDisabled}`}
            onClick={handleDisabledClick}
            aria-disabled="true"
            tabIndex={-1}
          >
            Carrito
          </Link> */}
        </nav>

        <button
          className={styles.themeBtn}
          onClick={onToggleTheme}
          aria-label="Cambiar tema"
        >
          {theme === 'light' ? <UilSun size="18" /> : <UilMoon size="18" />}
        </button>
      </header>

      {/* Bottom navbar - solo móvil */}
      <nav className={styles.bottomNav}>
        <Link
          to="/"
          className={`${styles.bottomLink} ${isActive('/') ? styles.bottomLinkActive : ''} ${styles.bottomLinkDisabled}`}
          onClick={handleDisabledClick}
          aria-disabled="true"
          tabIndex={-1}
        >
          <UilEstate size="22" />
          <span>Home</span>
        </Link>
        <Link
          to="/catalogo"
          className={`${styles.bottomLink} ${isActive('/catalogo') ? styles.bottomLinkActive : ''}`}
        >
          <UilStore size="22" />
          <span>Catálogo</span>
        </Link>
        <Link
          to="/carrito"
          className={`${styles.bottomLink} ${isActive('/carrito') ? styles.bottomLinkActive : ''} ${styles.bottomLinkDisabled}`}
          onClick={handleDisabledClick}
          aria-disabled="true"
          tabIndex={-1}
        >
          <UilShoppingCart size="22" />
          <span>Carrito</span>
        </Link>
        <button className={styles.bottomThemeBtn} onClick={onToggleTheme}>
          {theme === 'light' ? <UilSun size="22" /> : <UilMoon size="22" />}
          <span>Tema</span>
        </button>
      </nav>
    </>
  )
}