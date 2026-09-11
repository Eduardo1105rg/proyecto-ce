import { useState } from 'react'
import styles from './FilterPanel.module.css'
import { UilAngleDown } from '@iconscout/react-unicons'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import { Button } from '../../../../components/Button/Button'
import type { FacetSection } from '../../../../types/algolia'

type SortOption = {
  label: string
  value: string
}

type FilterPanelProps = {
  facetSections?: FacetSection[]
  onFacetToggle?: (attribute: string, value: string) => void
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

  const defaultSortValue = sortOptions?.[0]?.value ?? ''
  const placeholderMax = maxPrice ? maxPrice.toLocaleString('es-CR') : '500,000'

  const hasFilters =
    facetSections.some(section => section.items.some(item => item.isRefined)) ||
    !!minValue ||
    !!maxValue ||
    (sortBy !== undefined && sortBy !== defaultSortValue)

  function applyPriceFilter() {
    const min = parseInt(minValue.replace(/\D/g, '')) || 0
    const max = parseInt(maxValue.replace(/\D/g, '')) || maxPrice || 500000

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
            setMinValue('')
            setMaxValue('')
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

      {facetSections.map(section => (
        <FilterSection key={section.attribute} title={section.title}>
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

      <FilterSection title="Precio">
        <div className={styles.priceInputs}>
          <div className={styles.priceInputWrapper}>
            <span className={styles.priceInputLabel}>Mín</span>
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
            <span className={styles.priceInputLabel}>Máx</span>
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

    </aside>
  )
}