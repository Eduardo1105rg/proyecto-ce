import { useState } from 'react'
import { Range, getTrackBackground } from 'react-range'
import styles from './FilterPanel.module.css'
import { UilAngleDown } from '@iconscout/react-unicons'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'

// Categorías de prueba - luego vienen de Algolia
const MOCK_CATEGORIES = [
  'Cocina', 'Blancos para el Hogar', 'Electrónica',
  'Jardín', 'Deportes', 'Juguetes', 'Oficina'
]

const SORT_OPTIONS = [
  { label: 'Relevancia', value: 'relevance' },
  { label: 'Precio: menor a mayor', value: 'price_asc' },
  { label: 'Precio: mayor a menor', value: 'price_desc' },
  { label: 'Más nuevos', value: 'newest' },
  { label: 'Más antiguos', value: 'oldest' },
]

const MIN_PRICE = 0
const MAX_PRICE = 500000

type FilterPanelProps = {
  selectedCategories?: string[]
  onCategoriesChange?: (cats: string[]) => void
  priceRange?: [number, number]
  onPriceChange?: (range: [number, number]) => void
  sortBy?: string
  onSortChange?: (value: string) => void
  categories?: string[]
}

// Componente de sección colapsable
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
      <button className={styles.sectionHeader} onClick={() => setOpen(prev => !prev)}>
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

export function FilterPanel({
  selectedCategories = [],
  onCategoriesChange,
  priceRange = [MIN_PRICE, MAX_PRICE],
  onPriceChange,
  sortBy = 'relevance',
  onSortChange,
}: FilterPanelProps) {

  // Toggle de categoría
  function toggleCategory(cat: string) {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat]
    onCategoriesChange?.(next)
  }

  // Input manual de precio
  function handleMinInput(val: string) {
    const num = parseInt(val.replace(/\D/g, '')) || 0
    const clamped = Math.min(num, priceRange[1])
    onPriceChange?.([clamped, priceRange[1]])
  }

  function handleMaxInput(val: string) {
    const num = parseInt(val.replace(/\D/g, '')) || MAX_PRICE
    const clamped = Math.max(num, priceRange[0])
    onPriceChange?.([priceRange[0], clamped])
  }

  function formatPrice(val: number) {
    return `₡${val.toLocaleString('es-CR')}`
  }

  // Limpiar todos los filtros
  function clearAll() {
    onCategoriesChange?.([])
    onPriceChange?.([MIN_PRICE, MAX_PRICE])
    onSortChange?.('relevance')
  }

  const hasFilters = selectedCategories.length > 0 ||
    priceRange[0] > MIN_PRICE ||
    priceRange[1] < MAX_PRICE ||
    sortBy !== 'relevance'

  return (
    <aside className={styles.panel}>

      {/* Header del panel */}
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Filtros</span>
        {hasFilters && (
          <button className={styles.clearAll} onClick={clearAll}>
            Limpiar todo
          </button>
        )}
      </div>

      {/* Ordenar por */}
      <FilterSection title="Ordenar por">
        <Dropdown
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={(val) => onSortChange?.(val)}
        />
      </FilterSection>

      {/* Categorías */}
      <FilterSection title="Categoría">
        <div className={styles.checkList}>
          {MOCK_CATEGORIES.map(cat => (
            <label key={cat} className={styles.checkItem}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              <span className={styles.checkLabel}>{cat}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rango de precio */}
      <FilterSection title="Precio">
        <div className={styles.priceInputs}>
          <div className={styles.priceInputWrapper}>
            <span className={styles.priceInputLabel}>Mín</span>
            <input
              className={styles.priceInput}
              type="text"
              value={priceRange[0].toLocaleString('es-CR')}
              onChange={(e) => handleMinInput(e.target.value)}
            />
          </div>
          <span className={styles.priceSep}> </span>
          <div className={styles.priceInputWrapper}>
            <span className={styles.priceInputLabel}>Máx</span>
            <input
              className={styles.priceInput}
              type="text"
              value={priceRange[1].toLocaleString('es-CR')}
              onChange={(e) => handleMaxInput(e.target.value)}
            />
          </div>
        </div>

        {/* Slider doble */}
        <div className={styles.sliderWrapper}>
          <Range
            step={1000}
            min={MIN_PRICE}
            max={MAX_PRICE}
            values={priceRange}
            onChange={(vals) => onPriceChange?.([vals[0], vals[1]])}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                className={styles.track}
                style={{
                  ...props.style,
                  background: getTrackBackground({
                    values: priceRange,
                    colors: ['var(--slate-200)', 'var(--blue-600)', 'var(--slate-200)'],
                    min: MIN_PRICE,
                    max: MAX_PRICE,
                  }),
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div {...props} key={props.key} className={styles.thumb} />
            )}
          />
        </div>

        <div className={styles.priceLabels}>
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </FilterSection>

    </aside>
  )
}