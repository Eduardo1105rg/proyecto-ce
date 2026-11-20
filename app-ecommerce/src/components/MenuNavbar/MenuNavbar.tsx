import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UilSun, UilMoon, UilChartBar, UilShieldCheck } from '@iconscout/react-unicons'
import { useAuth } from '../../features/auth/useAuth'
import styles from './MenuNavbar.module.css'

type MenuNavbarProps = {
    abierto: boolean
    onCerrar: () => void
    theme: 'light' | 'dark'
    onToggleTheme: () => void
}

/**
 * Panel de acciones del Navbar: Analytics, panel administrativo y cambio de tema.
 * El botón que lo abre vive en el Navbar. Se cierra con Escape o al tocar fuera.
 */
export function MenuNavbar({ abierto, onCerrar, theme, onToggleTheme }: MenuNavbarProps) {
    const location = useLocation()
    const { usuario } = useAuth()

    useEffect(() => {
        if (!abierto) return
        const alPresionar = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCerrar()
        }
        document.addEventListener('keydown', alPresionar)
        return () => document.removeEventListener('keydown', alPresionar)
    }, [abierto, onCerrar])

    if (!abierto) return null

    const claseItem = (ruta: string) =>
        `${styles.item} ${location.pathname === ruta ? styles.itemActivo : ''}`

    return (
        <>
            <div className={styles.fondo} onClick={onCerrar} aria-hidden="true" />
            <nav id="menu-navbar" className={styles.panel} aria-label="Menú de acciones">
                {usuario && (
                    <Link to="/analytics" className={claseItem('/analytics')} onClick={onCerrar}>
                        <UilChartBar size="20" />
                        <span>Analytics</span>
                    </Link>
                )}
                {usuario?.rol === 'ADMIN' && (
                    <Link to="/admin" className={claseItem('/admin')} onClick={onCerrar}>
                        <UilShieldCheck size="20" />
                        <span>Panel administrativo</span>
                    </Link>
                )}
                {usuario && <div className={styles.separador} />}
                <button type="button" className={styles.item} onClick={onToggleTheme}>
                    {theme === 'light' ? <UilMoon size="20" /> : <UilSun size="20" />}
                    <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
                </button>
            </nav>
        </>
    )
}