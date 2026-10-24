/** Bloque de contenido dentro de una subsección de una política. */
export type PolicyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'groups'; groups: { title: string; items: string[] }[] }
  | { type: 'faq'; items: { question: string; answer: string }[] }

/** Subsección con título (se numera a., b., c. al mostrarse). */
export type PolicySection = {
  title: string
  blocks: PolicyBlock[]
}

export type Policy = {
  /** Fragmento de la URL: /politicas/<slug> */
  slug: string
  title: string
  sections: PolicySection[]
}