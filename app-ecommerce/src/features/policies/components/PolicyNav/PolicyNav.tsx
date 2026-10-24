import { PolicyIndexList } from '../PolicyIndexList/PolicyIndexList'
import styles from './PolicyNav.module.css'

type PolicyNavProps = {
	activeId: string
	activeSlug: string
	onSelect: (id: string) => void
}

/** Índice lateral (escritorio) con acceso a las políticas y sus apartados. */
export function PolicyNav({ activeId, activeSlug, onSelect }: PolicyNavProps) {
	return (
		<nav className={styles.nav} aria-label="Información comercial">
			<p className={styles.title}>Información</p>
			<PolicyIndexList activeId={activeId} activeSlug={activeSlug} onSelect={onSelect} />
		</nav>
	)
}