import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'
import logo from '../../assets/LogoNaranga.png'
import { UilSun, UilMoon, UilEstate, UilStore, UilShoppingCart } from '@iconscout/react-unicons'

/**
 * Props del componente Navbar.
 *
 * @prop theme          - Tema visual actual de la app ('light' | 'dark').
 * @prop onToggleTheme  - Callback para alternar entre tema claro y oscuro.
 */
type NavbarProps = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

/**
 * Barra de navegación principal de la aplicación.
 *
 * Renderiza dos navbars:
 * - **Header superior**: visible en desktop. Contiene el logo, links de navegación
 *   y el botón de cambio de tema.
 * - **Bottom navbar**: visible solo en móvil (controlado por CSS). Contiene íconos
 *   de navegación y el toggle de tema.
 *
 * Algunas rutas están marcadas como deshabilitadas (`navLinkDisabled`) mientras
 * sus páginas están en desarrollo. Se bloquea la navegación con `handleDisabledClick`
 * y se indican con `aria-disabled` para accesibilidad.
 *
 * La ruta activa se detecta con `useLocation` de React Router y se resalta
 * aplicando la clase `navLinkActive` / `bottomLinkActive`.
 *
 * @example
 * <Navbar theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
 */
export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const location = useLocation()

  /** Retorna true si el pathname actual coincide con la ruta dada */
  const isActive = (path: string) => location.pathname === path

  /**
   * Bloquea la navegación en links deshabilitados.
   * Se usa en rutas cuyas páginas aún no están implementadas.
   */
  const handleDisabledClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Página en desarrollo')
  }

  return (
    <>
      {/* Navbar superior - visible en desktop */}
      <header className={styles.navbar}>
        <Link to="/" className={styles.brand}>
          <img src={logo} alt="Logo" className={styles.logo} />
          MarketByte
        </Link>

        {/* Links de navegación desktop */}
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
          {/* Catálogo y Carrito comentados hasta que sus páginas estén listas */}
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

      {/* Bottom navbar - visible solo en móvil (CSS lo oculta en desktop) */}
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
          {theme === 'light' ? <UilSun size="22" /> : <UilMoon size="18" />}
          <span>Tema</span>
        </button>
      </nav>
    </>
  )
}