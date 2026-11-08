import {
	UilCheckCircle,
	UilEye,
	UilListUl,
	UilSearch,
	UilShoppingCartAlt,
	UilUser,
} from '@iconscout/react-unicons'
import type { ResumenGlobal as DatosResumenGlobal } from '../../analyticsApi'
import styles from './ResumenGlobal.module.css'

type ResumenGlobalProps = {
	resumen: DatosResumenGlobal
}

export function ResumenGlobal({ resumen }: ResumenGlobalProps) {
	const tarjetas = [
		{
			label: 'Usuarios con actividad',
			valor: resumen.usuariosActivos,
			icono: <UilUser size="20" />,
		},
		{
			label: 'Eventos registrados',
			valor: resumen.eventos,
			icono: <UilListUl size="20" />,
		},
		{
			label: 'Productos visualizados',
			valor: resumen.productosVistos,
			icono: <UilEye size="20" />,
		},
		{
			label: 'Búsquedas realizadas',
			valor: resumen.busquedas,
			icono: <UilSearch size="20" />,
		},
		{
			label: 'Productos agregados al carrito',
			valor: resumen.agregadosCarrito,
			icono: <UilShoppingCartAlt size="20" />,
		},
		{
			label: 'Compras realizadas',
			valor: resumen.compras,
			icono: <UilCheckCircle size="20" />,
		},
	]

	return (
		<ul className={styles.grid} aria-label="Resumen global de actividad">
			{tarjetas.map((tarjeta) => (
				<li key={tarjeta.label} className={styles.card}>
					<div className={styles.head}>
						<span className={styles.icon}>{tarjeta.icono}</span>
						<span className={styles.label}>{tarjeta.label}</span>
					</div>
					<span className={styles.value}>{tarjeta.valor}</span>
				</li>
			))}
		</ul>
	)
}
