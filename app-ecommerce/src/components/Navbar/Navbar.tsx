import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'
import logo from '../../assets/LogoNaranga.png'
import { UilSun, UilMoon, UilEstate, UilStore, UilShoppingCart } from '@iconscout/react-unicons'
import { useCarrito } from '../../context/carritoContext'

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
 * - **Header superior**: visible en desktop. Contiene el logo, el link al catálogo,
 *   el botón del carrito con su contador y el botón de cambio de tema.
 * - **Bottom navbar**: visible solo en móvil (controlado por CSS). Contiene íconos
 *   de navegación, el contador del carrito y el toggle de tema.
 *
 * Home sigue deshabilitado (`bottomLinkDisabled`) mientras su página no exista.
 * Se bloquea la navegación con `handleDisabledClick` y se indica con `aria-disabled`.
 *
 * La ruta activa se detecta con `useLocation` de React Router. El catálogo se
 * considera activo en `/` y en `/catalogo`, porque ambas muestran la misma página.
 *
 * El contador del carrito sale de `totales.articulos`, que es la suma de unidades
 * y no depende de la consulta a Algolia.
 *
 * @example
 * <Navbar theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
 */
export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const location = useLocation()
  const { totales } = useCarrito()

  /** Retorna true si el pathname actual coincide con la ruta dada */
  const isActive = (path: string) => location.pathname === path

  /** El catálogo vive en dos rutas: la raíz y /catalogo */
  const isCatalogActive = isActive('/') || isActive('/catalogo')

  const count = totales.articulos
  const badgeText = count > 99 ? '99+' : String(count)
  const cartLabel = `Carrito, ${count} ${count === 1 ? 'artículo' : 'artículos'}`

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
            to="/catalogo"
            className={`${styles.navLink} ${isCatalogActive ? styles.navLinkActive : ''}`}
          >
            Catálogo
          </Link>
        </nav>

        <div className={styles.actions}>
          <Link
            to="/carrito"
            className={`${styles.cartBtn} ${isActive('/carrito') ? styles.cartBtnActive : ''}`}
            aria-label={cartLabel}
          >
            <UilShoppingCart size="20" />
            {count > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {badgeText}
              </span>
            )}
          </Link>

          <button
            className={styles.themeBtn}
            onClick={onToggleTheme}
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? <UilSun size="18" /> : <UilMoon size="18" />}
          </button>
        </div>
      </header>

      {/* Bottom navbar - visible solo en móvil (CSS lo oculta en desktop) */}
      <nav className={styles.bottomNav}>
        <Link
          to="/"
          className={`${styles.bottomLink} ${styles.bottomLinkDisabled}`}
          onClick={handleDisabledClick}
          aria-disabled="true"
          tabIndex={-1}
        >
          <UilEstate size="22" />
          <span>Home</span>
        </Link>
        <Link
          to="/catalogo"
          className={`${styles.bottomLink} ${isCatalogActive ? styles.bottomLinkActive : ''}`}
        >
          <UilStore size="22" />
          <span>Catálogo</span>
        </Link>
        <Link
          to="/carrito"
          className={`${styles.bottomLink} ${isActive('/carrito') ? styles.bottomLinkActive : ''}`}
          aria-label={cartLabel}
        >
          <span className={styles.iconWrap}>
            <UilShoppingCart size="22" />
            {count > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {badgeText}
              </span>
            )}
          </span>
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