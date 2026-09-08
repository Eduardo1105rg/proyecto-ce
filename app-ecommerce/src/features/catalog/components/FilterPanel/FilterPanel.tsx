import { useState } from 'react'
import { Range, getTrackBackground } from 'react-range'
import styles from './FilterPanel.module.css'
import { UilAngleDown } from '@iconscout/react-unicons'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'

const FALLBACK_MIN = 0
const FALLBACK_MAX = 500000

type SortOption = {
  label: string
  value: string
}

type FilterPanelProps = {
  selectedCategories?: string[]
  onCategoriesChange?: (cats: string[]) => void
  priceRange?: [number, number]
  priceMin?: number   
  priceMax?: number   
  onPriceChange?: (range: [number, number]) => void
  sortBy?: string
  sortOptions?: SortOption[]  
  onSortChange?: (value: string) => void
  onClearAll?: () => void     
  categories?: string[]
}

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


const MOCK_CATEGORIES = [
  'Cocina', 'Blancos para el Hogar', 'Electrónica',
  'Jardín', 'Deportes', 'Juguetes', 'Oficina'
]

export function FilterPanel({
  selectedCategories = [],
  onCategoriesChange,
  priceRange,
  priceMin = FALLBACK_MIN,
  priceMax = FALLBACK_MAX,
  onPriceChange,
  sortBy,
  sortOptions,
  onSortChange,
  onClearAll,
}: FilterPanelProps) {

  const effectiveRange: [number, number] = priceRange ?? [priceMin, priceMax]

  function toggleCategory(cat: string) {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat]
    onCategoriesChange?.(next)
  }

  function handleMinInput(val: string) {
    const num = parseInt(val.replace(/\D/g, '')) || priceMin
    const clamped = Math.min(num, effectiveRange[1])
    onPriceChange?.([clamped, effectiveRange[1]])
  }

  function handleMaxInput(val: string) {
    const num = parseInt(val.replace(/\D/g, '')) || priceMax
    const clamped = Math.max(num, effectiveRange[0])
    onPriceChange?.([effectiveRange[0], clamped])
  }

  function formatPrice(val: number) {
    return `₡${val.toLocaleString('es-CR')}`
  }

  const defaultSortValue = sortOptions?.[0]?.value ?? ''

  const hasFilters =
    selectedCategories.length > 0 ||
    effectiveRange[0] > priceMin ||
    effectiveRange[1] < priceMax ||
    (sortBy !== undefined && sortBy !== defaultSortValue)
  const sliderReady = priceMin < priceMax


  return (
    <aside className={styles.panel}>

      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Filtros</span>
        {hasFilters && (
          <button className={styles.clearAll} onClick={onClearAll}>
            Limpiar todo
          </button>
        )}
      </div>

      {sortOptions && (
        <FilterSection title="Ordenar por">
          <Dropdown
            options={sortOptions}
            value={sortBy ?? defaultSortValue}
            onChange={(val) => onSortChange?.(val)}
          />
        </FilterSection>
      )}

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

      <FilterSection title="Precio">
        <div className={styles.priceInputs}>
          <div className={styles.priceInputWrapper}>
            <span className={styles.priceInputLabel}>Mín</span>
            <input
              className={styles.priceInput}
              type="text"
              value={effectiveRange[0].toLocaleString('es-CR')}
              onChange={(e) => handleMinInput(e.target.value)}
            />
          </div>
          <span className={styles.priceSep}> </span>
          <div className={styles.priceInputWrapper}>
            <span className={styles.priceInputLabel}>Máx</span>
            <input
              className={styles.priceInput}
              type="text"
              value={effectiveRange[1].toLocaleString('es-CR')}
              onChange={(e) => handleMaxInput(e.target.value)}
            />
          </div>
        </div>

        {sliderReady && (
          <div className={styles.sliderWrapper}>
            <Range
              step={1000}
              min={priceMin}
              max={priceMax}
              values={effectiveRange}
              onChange={(vals) => onPriceChange?.([vals[0], vals[1]])}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  className={styles.track}
                  style={{
                    ...props.style,
                    background: getTrackBackground({
                      values: effectiveRange,
                      colors: ['var(--slate-200)', 'var(--blue-600)', 'var(--slate-200)'],
                      min: priceMin,
                      max: priceMax,
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
        )}
        <div className={styles.priceLabels}>
          <span>{formatPrice(effectiveRange[0])}</span>
          <span>{formatPrice(effectiveRange[1])}</span>
        </div>
      </FilterSection>

    </aside>
  )
}