import { POLICIES } from './policiesContent'

/** Letra de un apartado: a., b., c. ... */
export const sectionLetter = (index: number) => String.fromCharCode(97 + index)

/** Identificador del elemento HTML de cada política (se usa para desplazarse hasta ella). */
export const policyAnchorId = (slug: string) => `politica-${slug}`

/** Identificador del elemento HTML de cada apartado (a, b, c...) de una política. */
export const sectionAnchorId = (slug: string, index: number) =>
    `politica-${slug}-${sectionLetter(index)}`

/** Relaciona cada identificador (política o apartado) con la política a la que pertenece. */
export const ANCHOR_SLUGS: ReadonlyMap<string, string> = new Map(
    POLICIES.flatMap((policy) => [
        [policyAnchorId(policy.slug), policy.slug] as const,
        ...policy.sections.map((_, index) => [sectionAnchorId(policy.slug, index), policy.slug] as const),
    ]),
)