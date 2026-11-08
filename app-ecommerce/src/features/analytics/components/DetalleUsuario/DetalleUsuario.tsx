import { useId } from 'react'
import type { EventoAnalytics } from '../../../../types/analytics'
import type { ResumenActividadUsuario } from '../../analyticsApi'
import styles from './DetalleUsuario.module.css'

type DetalleUsuarioProps = {
	resumen: ResumenActividadUsuario
	eventos: EventoAnalytics[]
}

function nombreVisible(usuario: ResumenActividadUsuario): string {
	if (usuario.usuarioNombre) return usuario.usuarioNombre
	if (usuario.usuarioId === 'anonimo') return 'Visitante anónimo'
	return usuario.usuarioId
}

function fechaVisible(fecha: string | null): string {
	if (!fecha) return 'sin actividad'

	return new Date(fecha).toLocaleString('es-CR', {
		dateStyle: 'medium',
		timeStyle: 'short',
	})
}

function productosVistos(eventos: EventoAnalytics[]): string[] {
	const vistos = [...eventos]
		.reverse()
		.filter((evento) => evento.tipo === 'vista_producto')
		.map((evento) => {
			const nombre = String(evento.detalle.nombre ?? '').trim()
			return nombre !== '' ? nombre : String(evento.detalle.productoId ?? '')
		})

	return [...new Set(vistos)].filter(Boolean).slice(0, 10)
}

function busquedasRecientes(eventos: EventoAnalytics[]): string[] {
	const busquedas = [...eventos]
		.reverse()
		.filter((evento) => evento.tipo === 'busqueda')
		.map((evento) => String(evento.detalle.termino ?? ''))

	return [...new Set(busquedas)].filter(Boolean).slice(0, 10)
}

export function DetalleUsuario({ resumen, eventos }: DetalleUsuarioProps) {
	const idTitulo = useId()
	const nombre = nombreVisible(resumen)
	const vistos = productosVistos(eventos)
	const busquedas = busquedasRecientes(eventos)

	const metricas = [
		{ label: 'Vistos', valor: resumen.metricas.productosVistos },
		{ label: 'Búsquedas', valor: resumen.metricas.busquedas },
		{ label: 'Al carrito', valor: resumen.metricas.agregadosCarrito },
		{ label: 'Compras', valor: resumen.metricas.compras },
	]

	return (
		<section className={styles.panel} aria-labelledby={idTitulo}>
			<header className={styles.header}>
				<div>
					<h2 id={idTitulo} className={styles.title}>
						Actividad de {nombre}
					</h2>
					<p className={styles.meta}>
						{resumen.rol ? `Rol ${resumen.rol}` : 'Sin rol registrado'} · Última
						actividad: {fechaVisible(resumen.ultimaActividad)}
					</p>
				</div>
				<span className={styles.id}>{resumen.usuarioId}</span>
			</header>

			<ul className={styles.metrics}>
				{metricas.map((metrica) => (
					<li key={metrica.label} className={styles.metric}>
						<span className={styles.metricValue}>{metrica.valor}</span>
						<span className={styles.metricLabel}>{metrica.label}</span>
					</li>
				))}
			</ul>

			<div className={styles.columns}>
				<div>
					<h3 className={styles.subtitle}>Productos vistos recientemente</h3>
					{vistos.length === 0 ? (
						<p className={styles.empty}>Sin productos vistos.</p>
					) : (
						<ul className={styles.chips}>
							{vistos.map((producto) => (
								<li key={producto} className={styles.chip}>
									{producto}
								</li>
							))}
						</ul>
					)}
				</div>

				<div>
					<h3 className={styles.subtitle}>Búsquedas recientes</h3>
					{busquedas.length === 0 ? (
						<p className={styles.empty}>Sin búsquedas realizadas.</p>
					) : (
						<ul className={styles.chips}>
							{busquedas.map((termino) => (
								<li key={termino} className={styles.chip}>
									{termino}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</section>
	)
}
