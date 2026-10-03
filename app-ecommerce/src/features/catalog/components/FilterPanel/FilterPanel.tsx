import { useCallback, useState } from 'react'
import { useClearRefinements, useRange, useRefinementList, useSortBy } from 'react-instantsearch'
import { UilAngleDown, UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons'
import styles from './FilterPanel.module.css'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import { Button } from '../../../../components/Button/Button'
import { FACET_SECTIONS, PRICE_ATTRIBUTE, SORT_OPTIONS } from '../../../../services/Algolia'
import type { FacetSectionDefinition } from '../../../../types/algolia'

/**
 * Maximo de valores mostrados por facet.
 *
 * useRefinementList solo devuelve 10 valores por defecto, pero el catalogo
 * necesita mostrar la lista completa (por ejemplo, brand tiene 26 marcas).
 */
const MAX_FACET_VALUES = 100

/**
 * Valor por defecto del input "Max" cuando el indice no declara price como
 * atributo facet y por lo tanto Algolia no puede calcular el limite superior.
 */
const FALLBACK_MAX_PRICE = 500000

/**
 * Normaliza un limite del refinamiento a number | undefined.
 *
 * useRange usa -Infinity e Infinity para representar "sin limite", y su rango
 * maximo cae a 0 cuando el atributo no viene declarado como facet en el indice.
 * Este helper descarta ambos casos para no pintar "Infinity" en los inputs ni
 * acotar el precio a 0.
 */
function toBound(value: number | undefined): number | undefined {
  return Number.isFinite(value) ? value : undefined
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
 * Seccion de refinamiento para un atributo de Algolia.
 *
 * Cada instancia monta su propio useRefinementList, por lo que los conteos que
 * muestra Algolia son disjuntivos: refinar "Cocina" recalcula los conteos de
 * Marca y Color sin ocultar las opciones que siguen disponibles.
 *
 * Se declara como componente hijo (y no un hook dentro de un map) porque los
 * hooks no pueden invocarse en un bucle de longitud variable. El recorrido
 * sobre FACET_SECTIONS es de longitud constante, pero aun asi cada seccion
 * necesita su propio scope de estado.
 *
 * @prop attribute - Atributo de Algolia a refinar.
 * @prop title     - Titulo visible de la seccion.
 * @prop labels    - Mapa opcional para traducir valores crudos (ej. 'true' -> 'Si').
 */
function FacetRefinement({ attribute, title, labels }: FacetSectionDefinition) {
  const { items, refine } = useRefinementList({
    attribute,
    limit: MAX_FACET_VALUES,
    transformItems: useCallback(
      (values) =>
        values.map((item) => ({
          ...item,
          label: labels?.[item.value] ?? item.label,
        })),
      [labels]
    ),
  })

  /** Sin valores disponibles la seccion no se renderiza */
  if (items.length === 0) return null

  return (
    <FilterSection title={title} defaultOpen={false}>
      <div className={styles.checkList}>
        {items.map((item) => (
          <label key={item.value} className={styles.checkItem}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={item.isRefined}
              onChange={() => refine(item.value)}
            />
            <span className={styles.checkLabel}>
              {item.label} <span className={styles.checkCount}>({item.count})</span>
            </span>
          </label>
        ))}
      </div>
    </FilterSection>
  )
}

/**
 * Panel lateral de filtros del catalogo.
 *
 * Se conecta directamente al estado de busqueda de Algolia mediante hooks
 * (useSortBy, useRange, useClearRefinements) y mediante un FacetRefinement por
 * cada entrada de FACET_SECTIONS.
 *
 * El selector de precio mantiene los inputs en estado local y solo llama a
 * refine al pulsar "Aplicar Rango" o Enter, conservando la validacion de que el
 * minimo no supere el maximo.
 *
 * Nota sobre el indice: price debe estar declarado en attributesForFaceting.
 * Con filterOnly(price) el filtrado por rango funciona, pero Algolia no devuelve
 * la distribucion del atributo y por eso useRange no puede calcular el precio
 * maximo real; en ese caso se usa FALLBACK_MAX_PRICE solo como placeholder.
 * Declararlo como numeric(price) hace que el placeholder sea exacto.
 */
export function FilterPanel() {

  const { options, currentRefinement, refine: refineSort } = useSortBy({ items: SORT_OPTIONS })

  const { range, start, refine: refineRange } = useRange({ attribute: PRICE_ATTRIBUTE })

  /** canRefine es true si hay query, facets o precio refinados */
  const { canRefine: canClear, refine: clearRefinements } = useClearRefinements()

  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [priceError, setPriceError] = useState<string | null>(null)

  /** Controla si el panel completo esta colapsado (solo muestra el header) */
  const [collapsed, setCollapsed] = useState(false)

  /** Tope real del catalogo; undefined si el indice no lo expone como facet */
  const rangeMax = toBound(range.max)

  const placeholderMax = rangeMax
    ? rangeMax.toLocaleString('es-CR')
    : FALLBACK_MAX_PRICE.toLocaleString('es-CR')

  /**
   * Refleja en los inputs el refinamiento de precio proveniente del exterior,
   * por ejemplo cuando el usuario pulsa "Limpiar todo".
   *
   * Se ajusta durante el render en lugar de en un efecto para evitar el segundo
   * render en cascada que produciria un useEffect con setState.
   */
  const startMin = toBound(start[0])
  const startMax = toBound(start[1])

  const [lastStartMin, setLastStartMin] = useState(startMin)
  const [lastStartMax, setLastStartMax] = useState(startMax)

  if (startMin !== lastStartMin || startMax !== lastStartMax) {
    setLastStartMin(startMin)
    setLastStartMax(startMax)
    setMinValue(startMin != null ? String(startMin) : '')
    setMaxValue(startMax != null ? String(startMax) : '')
  }

  /**
   * Parsea un input de precio ignorando caracteres no numericos.
   * Retorna undefined cuando el campo esta vacio, para no acotar el rango.
   */
  function parsePrice(value: string): number | undefined {
    const digits = value.replace(/\D/g, '')
    return digits ? parseInt(digits, 10) : undefined
  }

  /**
   * Valida y aplica el filtro de precio.
   * Si min > max, muestra un mensaje de error sin aplicar el filtro.
   * Con ambos campos vacios se quita el refinamiento de precio.
   */
  function applyPriceFilter() {
    const min = parsePrice(minValue)
    const max = parsePrice(maxValue) ?? rangeMax

    if (min != null && max != null && min > max) {
      setPriceError('El minimo no puede ser mayor que el maximo.')
      return
    }

    setPriceError(null)
    refineRange([min, max])
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
        {canClear && (
          <button className={styles.clearAll} onClick={() => {
            setPriceError(null)
            clearRefinements()
          }}>
            Limpiar todo
          </button>
        )}
      </div>

      {/* Cuerpo del panel - se oculta cuando collapsed es true */}
      {!collapsed && (
        <div className={styles.panelBody}>

          {options.length > 0 && (
            <FilterSection title="Ordenar por">
              <Dropdown
                options={options}
                value={currentRefinement}
                onChange={(val) => refineSort(val)}
              />
            </FilterSection>
          )}

          {/* Una seccion por cada entrada de FACET_SECTIONS; las vacias se descartan */}
          {FACET_SECTIONS.map((section) => (
            <FacetRefinement key={section.attribute} {...section} />
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
