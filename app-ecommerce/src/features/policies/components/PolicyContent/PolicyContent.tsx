import type { Policy, PolicyBlock } from '../../../../types/policy'
import { policyAnchorId } from '../../policyAnchor'
import styles from './PolicyContent.module.css'

type PolicyContentProps = {
	policy: Policy
}

/** a., b., c. ... para numerar las subsecciones. */
const letter = (index: number) => String.fromCharCode(97 + index)

function Block({ block }: { block: PolicyBlock }) {
	switch (block.type) {
		case 'paragraph':
			return <p className={styles.paragraph}>{block.text}</p>

		case 'list':
			return (
				<ul className={styles.list}>
					{block.items.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			)

		case 'groups':
			return (
				<div className={styles.groups}>
					{block.groups.map((group) => (
						<div key={group.title}>
							<h4 className={styles.groupTitle}>{group.title}</h4>
							<ul className={styles.list}>
								{group.items.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)

		case 'faq':
			return (
				<div className={styles.faq}>
					{block.items.map((item) => (
						<details key={item.question} className={styles.question}>
							<summary className={styles.summary}>{item.question}</summary>
							<p className={styles.answer}>{item.answer}</p>
						</details>
					))}
				</div>
			)
	}
}

/** Una política completa: título y subsecciones con su estructura. */
export function PolicyContent({ policy }: PolicyContentProps) {
	const id = policyAnchorId(policy.slug)

	return (
		<section id={id} className={styles.article} aria-labelledby={`${id}-titulo`}>
			<h2 id={`${id}-titulo`} className={styles.title}>
				{policy.title}
			</h2>

			{policy.sections.length === 0 && (
				<p className={styles.empty}>Esta sección se encuentra en preparación.</p>
			)}

			{policy.sections.map((section, index) => (
				<div key={section.title} className={styles.section}>
					<h3 className={styles.sectionTitle}>
						<span className={styles.letter}>{letter(index)}.</span> {section.title}
					</h3>
					{section.blocks.map((block, blockIndex) => (
						<Block key={blockIndex} block={block} />
					))}
				</div>
			))}
		</section>
	)
}