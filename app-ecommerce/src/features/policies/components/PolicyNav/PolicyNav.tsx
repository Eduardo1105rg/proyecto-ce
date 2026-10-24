import { useEffect, useRef } from 'react'
import { POLICIES } from '../../policiesContent'
import styles from './PolicyNav.module.css'

type PolicyNavProps = {
	activeSlug: string
	onSelect: (slug: string) => void
}

/** Índice con acceso a todas las políticas; resalta la que se está leyendo. */
export function PolicyNav({ activeSlug, onSelect }: PolicyNavProps) {
	const listRef = useRef<HTMLUListElement>(null)

	// En móvil la lista se desplaza en horizontal: mantiene visible la opción activa.
	useEffect(() => {
		const list = listRef.current
		const active = list?.querySelector<HTMLElement>('[aria-current="true"]')
		if (!list || !active || list.scrollWidth <= list.clientWidth) return
		list.scrollTo({
			left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2,
			behavior: 'smooth',
		})
	}, [activeSlug])

	return (
		<nav className={styles.nav} aria-label="Información comercial">
			<p className={styles.title}>Información</p>
			<ul className={styles.list} ref={listRef}>
				{POLICIES.map((policy) => {
					const isActive = policy.slug === activeSlug
					return (
						<li key={policy.slug}>
							<button
								type="button"
								className={`${styles.link} ${isActive ? styles.active : ''}`}
								aria-current={isActive ? 'true' : undefined}
								onClick={() => onSelect(policy.slug)}
							>
								{policy.title}
							</button>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}