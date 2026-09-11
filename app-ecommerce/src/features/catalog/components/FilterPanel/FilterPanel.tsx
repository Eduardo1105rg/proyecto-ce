import { useState } from 'react'
import styles from './FilterPanel.module.css'
import { UilAngleDown, UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons'
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
  maxPrice?: number
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
  isEmpty = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  isEmpty?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  if (isEmpty) return null

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

const LABEL_MAP: Record<string, string> = {
  'true': 'Exento de impuesto',
  'false': 'Con impuesto',
  'sinpe': 'Sinpe Móvil',
  'tarjeta': 'Tarjeta',
  'transferencia': 'Transferencia bancaria',
}

function formatLabel(raw: string): string {
  if (LABEL_MAP[raw]) return LABEL_MAP[raw]
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function CheckList({
  items,
  onToggle,
}: {
  items: FacetItem[]
  onToggle: (value: string) => void
}) {
  return (
    <div className={styles.checkList}>
      {items.map(item => (
        <label key={item.value} className={styles.checkItem}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={item.isRefined}
            onChange={() => onToggle(item.value)}
          />
          <span className={styles.checkLabel}>
            {formatLabel(item.label)}{' '}
            <span className={styles.checkCount}>({item.count})</span>
          </span>
        </label>
      ))}
    </div>
  )
}

export function FilterPanel({
  facetSections = [],
  onFacetToggle,
  onPriceChange,
  maxPrice,

  sortBy,
  sortOptions,
  onSortChange,
  onClearAll,
}: FilterPanelProps) {

  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [priceError, setPriceError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const [panelOpen, setPanelOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768
    }
    return true
  })

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setPanelOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  function handleClearAll() {
    if (minRef.current) minRef.current.value = ''
    if (maxRef.current) maxRef.current.value = ''
    setPriceError(null)
    onClearAll?.()
  }

  return (
    <aside className={styles.panel}>

      {/* Header principal - colapsable en móvil */}
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
          </FilterSection>

          <FilterSection title="Marca" isEmpty={brands.length === 0}>
            <CheckList
              items={brands}
              onToggle={(val) => {
                const item = brands.find(b => b.value === val)
                if (item) onBrandsChange?.([item.value])
              }}
            />
          </FilterSection>

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