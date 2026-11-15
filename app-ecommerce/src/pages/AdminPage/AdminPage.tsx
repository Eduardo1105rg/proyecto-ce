import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useAuth } from '../../features/auth/useAuth'
import styles from './AdminPage.module.css'

type Pestana = 'ordenes' | 'productos' | 'inventario'

const PESTANAS: Array<{ id: Pestana; label: string }> = [
	{ id: 'ordenes', label: 'Órdenes' },
	{ id: 'productos', label: 'Productos' },
	{ id: 'inventario', label: 'Inventario' },
]

export function AdminPage() {
	const { usuario } = useAuth()
	const [activa, setActiva] = useState<Pestana>('ordenes')

	const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, indice: number) => {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
		const paso = e.key === 'ArrowRight' ? 1 : PESTANAS.length - 1
		const siguiente = PESTANAS[(indice + paso) % PESTANAS.length]
		setActiva(siguiente.id)
		document.getElementById(`tab-${siguiente.id}`)?.focus()
	}

	return (
		<main className={styles.page}>
			<header className={styles.banner}>
				<div>
					<h1 className={styles.title}>Panel administrativo</h1>
					<p className={styles.subtitle}>
						Consulta de órdenes, productos e inventario. Sesión de {usuario?.nombre}.
					</p>
				</div>
				<span className={styles.badge}>Modo administrador</span>
			</header>

			<div className={styles.tabs} role="tablist" aria-label="Secciones del panel">
				{PESTANAS.map((p, indice) => (
					<button
						key={p.id}
						id={`tab-${p.id}`}
						type="button"
						role="tab"
						aria-selected={activa === p.id}
						aria-controls={`panel-${p.id}`}
						tabIndex={activa === p.id ? 0 : -1}
						className={`${styles.tab} ${activa === p.id ? styles.tabActive : ''}`}
						onClick={() => setActiva(p.id)}
						onKeyDown={(e) => handleKeyDown(e, indice)}
					>
						{p.label}
					</button>
				))}
			</div>

			<section
				id={`panel-${activa}`}
				role="tabpanel"
				aria-labelledby={`tab-${activa}`}
				className={styles.panel}
			>
				<p className={styles.placeholder}>
					Sección de {PESTANAS.find((p) => p.id === activa)?.label.toLowerCase()} en construcción.
				</p>
			</section>
		</main>
	)
}