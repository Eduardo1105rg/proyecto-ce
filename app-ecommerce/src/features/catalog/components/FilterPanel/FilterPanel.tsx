import { useState, useRef, useEffect } from 'react'
import styles from './FilterPanel.module.css'
import { UilAngleDown } from '@iconscout/react-unicons'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import { Button } from '../../../../components/Button/Button'

type SortOption = {
  label: string
  value: string
}

type FacetItem = {
  label: string
  value: string
  count: number
  isRefined: boolean
}

type FilterPanelProps = {
  categories?: FacetItem[]
  onCategoriesChange?: (cats: string[]) => void

  brands?: FacetItem[]
  onBrandsChange?: (values: string[]) => void

  subcategories?: FacetItem[]
  onSubcategoriesChange?: (values: string[]) => void

  colors?: FacetItem[]
  onColorsChange?: (values: string[]) => void

  materials?: FacetItem[]
  onMaterialsChange?: (values: string[]) => void

  stylesFacet?: FacetItem[]
  onStylesChange?: (values: string[]) => void

  ecoShipping?: FacetItem[]
  onEcoShippingChange?: (values: string[]) => void

  taxExempt?: FacetItem[]
  onTaxExemptChange?: (values: string[]) => void

  paymentMethods?: FacetItem[]
  onPaymentMethodsChange?: (values: string[]) => void

  onPriceChange?: (range: [number, number]) => void
  maxPrice?: number

  // Sort 
  sortBy?: string
  sortOptions?: SortOption[]
  onSortChange?: (value: string) => void

  onClearAll?: () => void
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
  categories = [],
  onCategoriesChange,

  brands = [],
  onBrandsChange,

  subcategories = [],
  onSubcategoriesChange,

  colors = [],
  onColorsChange,

  materials = [],
  onMaterialsChange,

  stylesFacet = [],
  onStylesChange,

  ecoShipping = [],
  onEcoShippingChange,

  taxExempt = [],
  onTaxExemptChange,

  paymentMethods = [],
  onPaymentMethodsChange,

  onPriceChange,
  maxPrice,

  sortBy,
  sortOptions,
  onSortChange,
  onClearAll,
}: FilterPanelProps) {

  const minRef = useRef<HTMLInputElement>(null)
  const maxRef = useRef<HTMLInputElement>(null)
  const [priceError, setPriceError] = useState<string | null>(null)

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
    categories.some(c => c.isRefined) ||
    brands.some(b => b.isRefined) ||
    subcategories.some(s => s.isRefined) ||
    colors.some(c => c.isRefined) ||
    materials.some(m => m.isRefined) ||
    stylesFacet.some(s => s.isRefined) ||
    ecoShipping.some(e => e.isRefined) ||
    taxExempt.some(t => t.isRefined) ||
    paymentMethods.some(p => p.isRefined) ||
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
        <button
          className={styles.panelTitleButton}
          onClick={() => setPanelOpen(prev => !prev)}
          aria-expanded={panelOpen}
        >
          <span className={styles.panelTitle}>Filtros</span>
          <UilAngleDown
            size="18"
            className={`${styles.chevron} ${styles.panelChevron} ${panelOpen ? styles.chevronOpen : ''}`}
          />
        </button>
        {hasFilters && panelOpen && (
          <button className={styles.clearAll} onClick={handleClearAll}>
            Limpiar todo
          </button>
        )}
      </div>

      {panelOpen && (
        <>
          {sortOptions && (
            <FilterSection title="Ordenar por">
              <Dropdown
                options={sortOptions}
                value={sortBy ?? defaultSortValue}
                onChange={(val) => onSortChange?.(val)}
              />
            </FilterSection>
          )}

          <FilterSection title="Categoría" isEmpty={categories.length === 0}>
            <CheckList
              items={categories}
              onToggle={(val) => {
                const item = categories.find(c => c.value === val)
                if (item) onCategoriesChange?.([item.label])
              }}
            />
          </FilterSection>

          <FilterSection title="Subcategoría" isEmpty={subcategories.length === 0}>
            <CheckList
              items={subcategories}
              onToggle={(val) => {
                const item = subcategories.find(s => s.value === val)
                if (item) onSubcategoriesChange?.([item.value])
              }}
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

          <FilterSection title="Color" isEmpty={colors.length === 0}>
            <CheckList
              items={colors}
              onToggle={(val) => {
                const item = colors.find(c => c.value === val)
                if (item) onColorsChange?.([item.value])
              }}
            />
          </FilterSection>

          <FilterSection title="Material" isEmpty={materials.length === 0}>
            <CheckList
              items={materials}
              onToggle={(val) => {
                const item = materials.find(m => m.value === val)
                if (item) onMaterialsChange?.([item.value])
              }}
            />
          </FilterSection>

          <FilterSection title="Estilo" isEmpty={stylesFacet.length === 0}>
            <CheckList
              items={stylesFacet}
              onToggle={(val) => {
                const item = stylesFacet.find(s => s.value === val)
                if (item) onStylesChange?.([item.value])
              }}
            />
          </FilterSection>

          <FilterSection title="Envío ecológico" isEmpty={ecoShipping.length === 0}>
            <CheckList
              items={ecoShipping}
              onToggle={(val) => {
                const item = ecoShipping.find(e => e.value === val)
                if (item) onEcoShippingChange?.([item.value])
              }}
            />
          </FilterSection>

          <FilterSection title="Exento de impuesto" isEmpty={taxExempt.length === 0}>
            <CheckList
              items={taxExempt}
              onToggle={(val) => {
                const item = taxExempt.find(t => t.value === val)
                if (item) onTaxExemptChange?.([item.value])
              }}
            />
          </FilterSection>

          <FilterSection title="Métodos de pago" isEmpty={paymentMethods.length === 0}>
            <CheckList
              items={paymentMethods}
              onToggle={(val) => {
                const item = paymentMethods.find(p => p.value === val)
                if (item) onPaymentMethodsChange?.([item.value])
              }}
            />
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
        </>
      )}

    </aside>
  )
}