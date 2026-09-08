import { useState, useRef } from 'react'
import styles from './FilterPanel.module.css'
import { UilAngleDown } from '@iconscout/react-unicons'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import { Button } from '../../../../components/Button/Button'

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
  onPriceChange?: (range: [number, number]) => void
  sortBy?: string
  sortOptions?: SortOption[]
  onSortChange?: (value: string) => void
  onClearAll?: () => void
  maxPrice?: number  // viene de CatalogPage calculado de los hits
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
  onPriceChange,
  sortBy,
  sortOptions,
  onSortChange,
  onClearAll,
  maxPrice,
}: FilterPanelProps) {

  const minRef = useRef<HTMLInputElement>(null)
  const maxRef = useRef<HTMLInputElement>(null)
  const [priceError, setPriceError] = useState<string | null>(null)

  const defaultSortValue = sortOptions?.[0]?.value ?? ''
  const placeholderMax = maxPrice ? maxPrice.toLocaleString('es-CR') : '500,000'

  const hasFilters =
    categories.some(c => c.isRefined) ||
    !!(minRef.current?.value) ||
    !!(maxRef.current?.value) ||
    (sortBy !== undefined && sortBy !== defaultSortValue)

  function applyPriceFilter() {
    const minRaw = minRef.current?.value ?? ''
    const maxRaw = maxRef.current?.value ?? ''

    const min = parseInt(minRaw.replace(/\D/g, '')) || 0
    const max = parseInt(maxRaw.replace(/\D/g, '')) || maxPrice || 500000

    if (min > max) {
      setPriceError('El mínimo no puede ser mayor que el máximo.')
      return
    }

    setPriceError(null)
    onPriceChange?.([min, max])
  }

  return (
    <aside className={styles.panel}>

      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Filtros</span>
        {hasFilters && (
          <button className={styles.clearAll} onClick={() => {
            if (minRef.current) minRef.current.value = ''
            if (maxRef.current) maxRef.current.value = ''
            setPriceError(null)
            onClearAll?.()
          }}>
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
              ref={minRef}
              className={`${styles.priceInput} ${priceError ? styles.priceInputError : ''}`}
              type="text"
              placeholder="0"
              onKeyDown={(e) => { if (e.key === 'Enter') applyPriceFilter() }}
            />
          </div>
          <span className={styles.priceSep}> </span>
          <div className={styles.priceInputWrapper}>
            <span className={styles.priceInputLabel}>Máx</span>
            <input
              ref={maxRef}
              className={`${styles.priceInput} ${priceError ? styles.priceInputError : ''}`}
              type="text"
              placeholder={placeholderMax}
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

    </aside>
  )
}