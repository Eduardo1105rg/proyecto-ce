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

type CategoryItem = {
  label: string
  value: string
  count: number
  isRefined: boolean
}

type FilterPanelProps = {
  selectedCategories?: string[]
  onCategoriesChange?: (cats: string[]) => void
  categories?: CategoryItem[]
  priceRange?: [number, number]
  priceMin?: number
  priceMax?: number
  onPriceChange?: (range: [number, number]) => void
  sortBy?: string
  sortOptions?: SortOption[]
  onSortChange?: (value: string) => void
  onClearAll?: () => void
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

export function FilterPanel({
  onCategoriesChange,
  categories = [],
  priceRange,
  priceMin = FALLBACK_MIN,
  priceMax = FALLBACK_MAX,
  onPriceChange,
  sortBy,
  sortOptions,
  onSortChange,
  onClearAll,
}: FilterPanelProps) {
  const [localMin, setLocalMin] = useState<string>('')
  const [localMax, setLocalMax] = useState<string>('')

  const effectiveRange: [number, number] = priceRange ?? [priceMin, priceMax]

  function formatPrice(val: number) {
    return `₡${val.toLocaleString('es-CR')}`
  }

  const defaultSortValue = sortOptions?.[0]?.value ?? ''
  const sliderReady = priceMin < priceMax

  const hasFilters =
    categories.some(c => c.isRefined) ||
    effectiveRange[0] > priceMin ||
    effectiveRange[1] < priceMax ||
    (sortBy !== undefined && sortBy !== defaultSortValue)

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
          {categories.map(cat => (
            <label key={cat.value} className={styles.checkItem}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={cat.isRefined}
                onChange={() => onCategoriesChange?.([cat.label])}
              />
              <span className={styles.checkLabel}>
                {cat.label} <span className={styles.checkCount}>({cat.count})</span>
              </span>
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
              placeholder="0"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value.replace(/\D/g, ''))}
              onBlur={() => {
                const num = parseInt(localMin) || 0
                onPriceChange?.([num, parseInt(localMax) || priceMax || FALLBACK_MAX])
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const num = parseInt(localMin) || 0
                  onPriceChange?.([num, parseInt(localMax) || priceMax || FALLBACK_MAX])
                }
              }}
            />
          </div>
          <span className={styles.priceSep}> </span>
          <div className={styles.priceInputWrapper}>
            <span className={styles.priceInputLabel}>Máx</span>
            <input
              className={styles.priceInput}
              type="text"
              placeholder="500000"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value.replace(/\D/g, ''))}
              onBlur={() => {
                const num = parseInt(localMax) || FALLBACK_MAX
                onPriceChange?.([parseInt(localMin) || 0, num])
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const num = parseInt(localMax) || FALLBACK_MAX
                  onPriceChange?.([parseInt(localMin) || 0, num])
                }
              }}
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