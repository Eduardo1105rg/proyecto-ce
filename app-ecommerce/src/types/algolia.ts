/**
 * Definicion estatica de una seccion de facetas del catalogo.
 *
 * @prop attribute - Atributo de Algolia sobre el que se aplica el refinamiento.
 * @prop title     - Titulo visible de la seccion en el FilterPanel.
 * @prop labels    - Mapa opcional para reemplazar valores crudos (ej. 'true' -> 'Si').
 */
export type FacetSectionDefinition = {
    attribute: string
    title: string
    labels?: Record<string, string>
}
