import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PolicyContent } from '../../features/policies/components/PolicyContent/PolicyContent'
import { PolicyNav } from '../../features/policies/components/PolicyNav/PolicyNav'
import { POLICIES } from '../../features/policies/policiesContent'
import { policyAnchorId } from '../../features/policies/policyAnchor'
import styles from './PoliciesPage.module.css'

/** Tiempo en que el índice ignora el desplazamiento tras un clic (evita parpadeos). */
const LOCK_MS = 900

function scrollToPolicy(slug: string, smooth: boolean) {
	const element = document.getElementById(policyAnchorId(slug))
	if (!element) return
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	element.scrollIntoView({ behavior: smooth && !reduceMotion ? 'smooth' : 'auto', block: 'start' })
}

/** Información comercial: todas las políticas en una sola página con índice que sigue la lectura. */
export function PoliciesPage() {
	const { slug } = useParams()
	const [activeSlug, setActiveSlug] = useState(POLICIES[0].slug)
	const lockRef = useRef(false)
	const timerRef = useRef<number | null>(null)

	// Al llegar desde un enlace (/politicas/envios) baja directo a esa sección.
	useEffect(() => {
		if (slug) scrollToPolicy(slug, false)
	}, [slug])

	// Marca en el índice la política que se está leyendo.
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (lockRef.current) return
				const visible = entries.find((entry) => entry.isIntersecting)
				if (!visible) return
				const policy = POLICIES.find((item) => policyAnchorId(item.slug) === visible.target.id)
				if (policy) setActiveSlug(policy.slug)
			},
			{ rootMargin: '-140px 0px -65% 0px' },
		)

		POLICIES.forEach((item) => {
			const element = document.getElementById(policyAnchorId(item.slug))
			if (element) observer.observe(element)
		})

		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		return () => {
			if (timerRef.current !== null) window.clearTimeout(timerRef.current)
		}
	}, [])

	const handleSelect = (target: string) => {
		setActiveSlug(target)
		lockRef.current = true
		if (timerRef.current !== null) window.clearTimeout(timerRef.current)
		timerRef.current = window.setTimeout(() => {
			lockRef.current = false
		}, LOCK_MS)
		scrollToPolicy(target, true)
	}

	return (
		<main className={styles.page}>
			<PolicyNav activeSlug={activeSlug} onSelect={handleSelect} />

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