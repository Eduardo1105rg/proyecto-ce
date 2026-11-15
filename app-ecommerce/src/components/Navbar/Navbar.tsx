import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'
import logo from '../../assets/LogoNaranga.png'
import { UilBars, UilTimes, UilEstate, UilStore, UilShoppingCart, UilUser, UilReceipt } from '@iconscout/react-unicons'
import { useCarrito } from '../../context/carritoContext'
import { MiniCart } from '../../features/cart/components/MiniCart/MiniCart'
import { UserChip } from '../../features/auth/components/UserChip/UserChip'
import { useAuth } from '../../features/auth/useAuth'
import { MenuNavbar } from '../MenuNavbar/MenuNavbar'

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
 * - **Header superior**: visible en desktop. Contiene el logo, los links principales,
 *   el carrito con su contador y el botón del menú de acciones.
 * - **Bottom navbar**: visible solo en móvil (controlado por CSS). Contiene los links
 *   principales, el carrito, el acceso a la sesión y el botón del menú de acciones.
 *
 * El menú de acciones (`MenuNavbar`) agrupa Analytics, el panel administrativo y el
 * cambio de tema. Se abre desde un botón hamburguesa que pasa a una X y se cierra
 * solo al cambiar de ruta.
 *
 * Home sigue deshabilitado (`bottomLinkDisabled`) mientras su página no exista.
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
	const { usuario } = useAuth()

	/** Ruta en la que se abrió el menú; al cambiar de ruta deja de coincidir y se cierra */
	const [rutaMenu, setRutaMenu] = useState<string | null>(null)
	const menuAbierto = rutaMenu === location.pathname
	const alternarMenu = () => setRutaMenu(menuAbierto ? null : location.pathname)
	const cerrarMenu = () => setRutaMenu(null)

	/** Retorna true si el pathname actual coincide con la ruta dada */
	const isActive = (path: string) => location.pathname === path

	/** El catálogo vive en dos rutas: la raíz y /catalogo */
	const isCatalogActive = isActive('/') || isActive('/catalogo')

	const count = totales.articulos
	const badgeText = count > 99 ? '99+' : String(count)
	const cartLabel = `Carrito, ${count} ${count === 1 ? 'artículo' : 'artículos'}`
	const menuLabel = menuAbierto ? 'Cerrar menú' : 'Abrir menú'

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
					{usuario && usuario.rol !== 'ADMIN' && (
						<Link
							to="/mis-ordenes"
							className={`${styles.navLink} ${isActive('/mis-ordenes') ? styles.navLinkActive : ''}`}
						>
							Mis órdenes
						</Link>
					)}
				</nav>

				<div className={styles.actions}>
					<UserChip />
					{usuario?.rol !== 'ADMIN' && (
						<MiniCart>
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
						</MiniCart>
					)}
					<button
						className={`${styles.themeBtn} ${menuAbierto ? styles.menuBtnAbierto : ''}`}
						onClick={alternarMenu}
						aria-label={menuLabel}
						aria-expanded={menuAbierto}
						aria-controls="menu-navbar"
					>
						{menuAbierto ? <UilTimes size="20" /> : <UilBars size="20" />}
					</button>
				</div>
			</header>

			<MenuNavbar
				abierto={menuAbierto}
				onCerrar={cerrarMenu}
				theme={theme}
				onToggleTheme={onToggleTheme}
			/>

			{/* Bottom navbar - visible solo en móvil (CSS lo oculta en desktop) */}
			<nav className={styles.bottomNav}>
				{usuario && usuario.rol !== 'ADMIN' ? (
					<Link
						to="/mis-ordenes"
						className={`${styles.bottomLink} ${isActive('/mis-ordenes') ? styles.bottomLinkActive : ''}`}
					>
						<UilReceipt size="22" />
						<span>Órdenes</span>
					</Link>
				) : (
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
				)}
				<Link
					to="/catalogo"
					className={`${styles.bottomLink} ${isCatalogActive ? styles.bottomLinkActive : ''}`}
				>
					<UilStore size="22" />
					<span>Catálogo</span>
				</Link>
				{usuario?.rol !== 'ADMIN' && (
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
				)}
				<Link
					to="/login"
					className={`${styles.bottomLink} ${isActive('/login') ? styles.bottomLinkActive : ''}`}
				>
					<UilUser size="22" />
					<span>{usuario ? 'Usuario' : 'Ingresar'}</span>
				</Link>
				<button
					className={`${styles.bottomThemeBtn} ${menuAbierto ? styles.bottomMenuAbierto : ''}`}
					onClick={alternarMenu}
					aria-label={menuLabel}
					aria-expanded={menuAbierto}
					aria-controls="menu-navbar"
				>
					{menuAbierto ? <UilTimes size="22" /> : <UilBars size="22" />}
					<span>Menú</span>
				</button>
			</nav>
		</>
	)
}