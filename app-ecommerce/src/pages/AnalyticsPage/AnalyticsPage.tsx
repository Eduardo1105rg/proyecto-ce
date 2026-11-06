import { UilEye, UilSearch, UilShoppingCartAlt, UilCheckCircle } from '@iconscout/react-unicons'
import { useAuth } from '../../features/auth/useAuth'
import {
    obtenerBusquedasRecientes,
    obtenerMetricas,
} from '../../features/analytics/analyticsApi'
import { useVistosRecientes } from '../../features/analytics/usePersonalizacion.mock'
import { ListaVistos } from '../../features/analytics/components/ListaVistos/ListaVistos'
import styles from './AnalyticsPage.module.css'

export function AnalyticsPage() {
    const { usuario } = useAuth()
    const vistos = useVistosRecientes()

    if (!usuario) return null

    const metricas = obtenerMetricas(usuario.id)
    const busquedas = obtenerBusquedasRecientes(usuario.id)

	const tarjetas = [
		{ label: 'Productos visualizados', valor: metricas.productosVistos, icono: <UilEye size="20" /> },
		{ label: 'Búsquedas realizadas', valor: metricas.busquedas, icono: <UilSearch size="20" /> },
		{
			label: 'Productos agregados al carrito',
			valor: metricas.agregadosCarrito,
			icono: <UilShoppingCartAlt size="20" />,
		},
		{ label: 'Compras realizadas', valor: metricas.compras, icono: <UilCheckCircle size="20" /> },
	]

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Su actividad</h1>
                <p className={styles.subtitle}>
                    Resumen de lo que ha hecho en la tienda con la sesión de {usuario.nombre}.
                </p>
            </header>

			<ul className={styles.metrics}>
				{tarjetas.map((t) => (
					<li key={t.label} className={styles.metric}>
						<div className={styles.metricHead}>
							<span className={styles.metricIcon}>{t.icono}</span>
							<span className={styles.metricLabel}>{t.label}</span>
						</div>
						<span className={styles.metricValue}>{t.valor}</span>
					</li>
				))}
			</ul>

            <div className={styles.columns}>
                <ListaVistos
                    titulo="Productos vistos recientemente"
                    productos={vistos.productos}
                    cargando={vistos.cargando}
                    mensajeVacio="Aún no ha visto ningún producto."
                />

                <section className={styles.panel} aria-labelledby="titulo-busquedas">
                    <header className={styles.panelHeader}>
                        <h2 id="titulo-busquedas" className={styles.panelTitle}>
                            Búsquedas recientes
                        </h2>
                    </header>

                    {busquedas.length === 0 ? (
                        <p className={styles.empty}>Aún no ha realizado búsquedas.</p>
                    ) : (
                        <ul className={styles.chips}>
                            {busquedas.map((b) => (
                                <li key={b} className={styles.chip}>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )
}