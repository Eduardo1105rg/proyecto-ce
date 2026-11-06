import type { ResumenActividadUsuario } from '../../analyticsApi'
import styles from './TablaUsuarios.module.css'

type TablaUsuariosProps = {
	usuarios: ResumenActividadUsuario[]
	seleccionadoId: string | null
	onSeleccionar: (usuarioId: string) => void
}

function nombreVisible(usuario: ResumenActividadUsuario): string {
	if (usuario.usuarioNombre) return usuario.usuarioNombre
	if (usuario.usuarioId === 'anonimo') return 'Visitante anónimo'
	return usuario.usuarioId
}

function fechaVisible(fecha: string | null): string {
	if (!fecha) return '—'

	return new Date(fecha).toLocaleString('es-CR', {
		dateStyle: 'short',
		timeStyle: 'short',
	})
}

function claseRol(rol: ResumenActividadUsuario['rol']): string {
	if (rol === 'ADMIN') return styles.rolAdmin
	if (rol === 'B2B') return styles.rolB2b
	return styles.rolB2c
}

export function TablaUsuarios({
	usuarios,
	seleccionadoId,
	onSeleccionar,
}: TablaUsuariosProps) {
	if (usuarios.length === 0) {
		return <p className={styles.empty}>Aún no hay actividad registrada en este navegador.</p>
	}

	return (
		<div className={styles.wrap}>
			<table className={styles.table}>
				<caption className={styles.caption}>Actividad registrada por usuario</caption>
				<thead>
					<tr>
						<th scope="col">Usuario</th>
						<th scope="col">Rol</th>
						<th scope="col">Eventos</th>
						<th scope="col">Vistos</th>
						<th scope="col">Búsquedas</th>
						<th scope="col">Carrito</th>
						<th scope="col">Compras</th>
						<th scope="col">Última actividad</th>
						<th scope="col">Detalle</th>
					</tr>
				</thead>
				<tbody>
					{usuarios.map((usuario) => {
						const activo = usuario.usuarioId === seleccionadoId

						return (
							<tr key={usuario.usuarioId} className={activo ? styles.rowActive : undefined}>
								<td>
									<span className={styles.nombre}>{nombreVisible(usuario)}</span>
									<span className={styles.identificador}>{usuario.usuarioId}</span>
								</td>
								<td>
									{usuario.rol ? (
										<span className={`${styles.rol} ${claseRol(usuario.rol)}`}>
											{usuario.rol}
										</span>
									) : (
										'—'
									)}
								</td>
								<td>{usuario.eventos}</td>
								<td>{usuario.metricas.productosVistos}</td>
								<td>{usuario.metricas.busquedas}</td>
								<td>{usuario.metricas.agregadosCarrito}</td>
								<td>{usuario.metricas.compras}</td>
								<td>{fechaVisible(usuario.ultimaActividad)}</td>
								<td>
									<button
										type="button"
										className={styles.accion}
										aria-pressed={activo}
										onClick={() => onSeleccionar(usuario.usuarioId)}
									>
										{activo ? 'Ocultar detalle' : 'Ver detalle'}
									</button>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
