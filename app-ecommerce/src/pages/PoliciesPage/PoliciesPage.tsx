import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PolicyContent } from '../../features/policies/components/PolicyContent/PolicyContent'
import { PolicyMobileMenu } from '../../features/policies/components/PolicyMobileMenu/PolicyMobileMenu'
import { PolicyNav } from '../../features/policies/components/PolicyNav/PolicyNav'
import { POLICIES } from '../../features/policies/policiesContent'
import { ANCHOR_SLUGS, policyAnchorId } from '../../features/policies/policyAnchor'
import styles from './PoliciesPage.module.css'

/** Tiempo en que el índice ignora el desplazamiento tras un clic (evita parpadeos). */
const LOCK_MS = 900

function scrollToId(id: string, smooth: boolean) {
	const element = document.getElementById(id)
	if (!element) return
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	element.scrollIntoView({ behavior: smooth && !reduceMotion ? 'smooth' : 'auto', block: 'start' })
}

/** Información comercial: todas las políticas en una sola página con índice que sigue la lectura. */
export function PoliciesPage() {
	const { slug } = useParams()
	const [activeId, setActiveId] = useState(() => policyAnchorId(POLICIES[0].slug))
	const lockRef = useRef(false)
	const timerRef = useRef<number | null>(null)

	const activeSlug = ANCHOR_SLUGS.get(activeId) ?? POLICIES[0].slug

	// Al llegar desde un enlace (/politicas/envios) baja directo a esa sección.
	useEffect(() => {
		if (slug) scrollToId(policyAnchorId(slug), false)
	}, [slug])

	// Marca en el índice la política y el apartado que se están leyendo.
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (lockRef.current) return
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top)[0]
				if (visible) setActiveId(visible.target.id)
			},
			{ rootMargin: '-120px 0px -70% 0px' },
		)

		ANCHOR_SLUGS.forEach((_, id) => {
			const element = document.getElementById(id)
			if (element) observer.observe(element)
		})

		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		return () => {
			if (timerRef.current !== null) window.clearTimeout(timerRef.current)
		}
	}, [])

	const handleSelect = (id: string) => {
		setActiveId(id)
		lockRef.current = true
		if (timerRef.current !== null) window.clearTimeout(timerRef.current)
		timerRef.current = window.setTimeout(() => {
			lockRef.current = false
		}, LOCK_MS)
		scrollToId(id, true)
	}

	return (
		<main className={styles.page}>
			<PolicyNav activeId={activeId} activeSlug={activeSlug} onSelect={handleSelect} />
			<PolicyMobileMenu activeId={activeId} activeSlug={activeSlug} onSelect={handleSelect} />

			<div className={styles.content}>
				<header className={styles.header}>
					<h1 className={styles.title}>Información comercial</h1>
					<p className={styles.subtitle}>
						Conozca las condiciones de compra, envíos, devoluciones y el manejo de sus datos en
						MarketByte.
					</p>
				</header>

				{POLICIES.map((policy) => (
					<PolicyContent key={policy.slug} policy={policy} />
				))}
			</div>
		</main>
	)
}