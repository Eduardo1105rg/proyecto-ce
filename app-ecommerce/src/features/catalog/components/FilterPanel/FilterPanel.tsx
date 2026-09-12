import { useState } from 'react'
import styles from './FilterPanel.module.css'
import { UilAngleDown, UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import { Button } from '../../../../components/Button/Button'
import type { FacetSection } from '../../../../types/algolia'

/**
 * Opcion de ordenamiento para el selector de sort.
 *
 * @prop label - Texto visible en el dropdown.
 * @prop value - Nombre del indice de Algolia al que apunta esta opcion.
 */
type SortOption = {
  label: string
  value: string
}

/**
 * Props del componente FilterPanel.
 *
 * @prop facetSections  - Lista de secciones de facets generadas desde CatalogPage.
 *                        Cada seccion incluye su titulo, atributo y los items con su estado de refinamiento.
 * @prop onFacetToggle  - Callback que recibe el atributo y el valor del facet clickeado.
 *                        La logica de refinamiento la maneja Algolia desde CatalogPage.
 * @prop onPriceChange  - Callback con el rango [min, max] cuando se aplica el filtro de precio.
 * @prop sortBy         - Valor del indice de ordenamiento actualmente activo.
 * @prop sortOptions    - Opciones disponibles para el selector de sort.
 * @prop onSortChange   - Callback que recibe el value del indice seleccionado.
 * @prop onClearAll     - Callback para limpiar todos los filtros activos.
 * @prop maxPrice       - Precio maximo calculado desde los hits de Algolia, usado como placeholder.
 */
type FilterPanelProps = {
  facetSections?: FacetSection[]
  onFacetToggle?: (attribute: string, value: string) => void
  onPriceChange?: (range: [number, number]) => void
  sortBy?: string
  sortOptions?: SortOption[]
  onSortChange?: (value: string) => void
  onClearAll?: () => void
  maxPrice?: number
}

/**
 * Seccion colapsable dentro del FilterPanel.
 *
 * Cada facet y el filtro de precio viven dentro de un FilterSection.
 * El estado abierto/cerrado es local al componente.
 *
 * @prop title       - Titulo visible en el header de la seccion.
 * @prop children    - Contenido de la seccion (checklist, inputs, etc.).
 * @prop defaultOpen - Si la seccion inicia abierta. Por defecto: true.
 */
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={styles.section}>
      <button
        className={styles.sectionHeader}
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <span className={styles.sectionTitle}>{title}</span>
        <UilAngleDown
          size="18"
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
        />
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  )
}

/**
 * Panel lateral de filtros del catalogo.
 *
 * Recibe todas las secciones de facets como un arreglo generico (FacetSection[]),
 * lo que permite agregar o quitar facets desde CatalogPage sin modificar este componente.
 *
 */
export function FilterPanel({
  facetSections = [],
  onFacetToggle,
  onPriceChange,
  sortBy,
  sortOptions,
  onSortChange,
  onClearAll,
  maxPrice,
}: FilterPanelProps) {

  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [priceError, setPriceError] = useState<string | null>(null)

  /** Controla si el panel completo esta colapsado (solo muestra el header) */
  const [collapsed, setCollapsed] = useState(false)

  const defaultSortValue = sortOptions?.[0]?.value ?? ''
  const placeholderMax = maxPrice ? maxPrice.toLocaleString('es-CR') : '500,000'

  /** true si hay al menos un filtro activo (facet, precio o sort diferente al default) */
  const hasFilters =
    facetSections.some(section => section.items.some(item => item.isRefined)) ||
    !!minValue ||
    !!maxValue ||
    (sortBy !== undefined && sortBy !== defaultSortValue)

  /**
   * Valida y aplica el filtro de precio.
   * Parsea los strings de los inputs eliminando caracteres no numericos.
   * Si min > max, muestra un mensaje de error sin aplicar el filtro.
   */
  function applyPriceFilter() {
    const min = parseInt(minValue.replace(/\D/g, '')) || 0
    const max = parseInt(maxValue.replace(/\D/g, '')) || maxPrice || 500000

    if (min > max) {
      setPriceError('El minimo no puede ser mayor que el maximo.')
      return
    }

    setPriceError(null)
    onPriceChange?.([min, max])
  }

  return (
    <aside className={styles.panel}>

      {/* Header del panel - siempre visible, incluye boton de colapso y limpiar todo */}
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLeft}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setCollapsed(prev => !prev)}
            aria-label={collapsed ? 'Expandir filtros' : 'Contraer filtros'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expandir filtros' : 'Contraer filtros'}
          >
            {collapsed ? <UilAngleRight size="16" /> : <UilAngleLeft size="16" />}
          </button>
          <span className={styles.panelTitle}>Filtros</span>
        </div>
        {hasFilters && (
          <button className={styles.clearAll} onClick={() => {
            setMinValue('')
            setMaxValue('')
            setPriceError(null)
            onClearAll?.()
          }}>
            Limpiar todo
          </button>
        )}
      </div>

      {/* Cuerpo del panel - se oculta cuando collapsed es true */}
      {!collapsed && (
        <div className={styles.panelBody}>

          {sortOptions && (
            <FilterSection title="Ordenar por">
              <Dropdown
                options={sortOptions}
                value={sortBy ?? defaultSortValue}
                onChange={(val) => onSortChange?.(val)}
              />
            </FilterSection>
          )}

          {/* Renderiza dinamicamente cada seccion de facet recibida desde CatalogPage */}
          {facetSections.map(section => (
            <FilterSection key={section.attribute} title={section.title} defaultOpen={false}>
              <div className={styles.checkList}>
                {section.items.map(item => (
                  <label key={item.value} className={styles.checkItem}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={item.isRefined}
                      onChange={() => onFacetToggle?.(section.attribute, item.value)}
                    />
                    <span className={styles.checkLabel}>
                      {item.label} <span className={styles.checkCount}>({item.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          ))}

          {/* Filtro de precio - siempre al final del panel */}
          <FilterSection title="Precio">
            <div className={styles.priceInputs}>
              <div className={styles.priceInputWrapper}>
                <span className={styles.priceInputLabel}>Min</span>
                <input
                  className={`${styles.priceInput} ${priceError ? styles.priceInputError : ''}`}
                  type="text"
                  placeholder="0"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyPriceFilter() }}
                />
              </div>
              <span className={styles.priceSep}> </span>
              <div className={styles.priceInputWrapper}>
                <span className={styles.priceInputLabel}>Max</span>
                <input
                  className={`${styles.priceInput} ${priceError ? styles.priceInputError : ''}`}
                  type="text"
                  placeholder={placeholderMax}
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyPriceFilter() }}
                />
              </div>
            </div>

            {priceError && (
              <p className={styles.priceError}>{priceError}</p>
            )}

            <Button
              label="Aplicar Rango"
              variant="soft"
              size="sm"
              fullWidth
              onClick={applyPriceFilter}
            />
          </FilterSection>
        </div>
      )}

    </aside>
  )
}