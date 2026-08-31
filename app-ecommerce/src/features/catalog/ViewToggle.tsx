import styles from './ViewToggle.module.css'
import { UilListUl, UilGrid , UilTh, UilGrids } from '@iconscout/react-unicons'

type ViewMode = 'grid' | 'list'
type Columns = 3 | 4 | 5

type ViewToggleProps = {
  viewMode: ViewMode
  columns: Columns
  onViewChange: (mode: ViewMode) => void
  onColumnsChange: (cols: Columns) => void
}

export function ViewToggle({ viewMode, columns, onViewChange, onColumnsChange }: ViewToggleProps) {
  return (
    <div className={styles.wrapper}>

      {/* Selector de columnas - solo visible en modo grid */}
      {viewMode === 'grid' && (
        <div className={styles.group}>
          <button
            className={`${styles.btn} ${columns === 3 ? styles.active : ''}`}
            onClick={() => onColumnsChange(3)}
            aria-label="3 columnas"
            title="3 columnas"
          >
            <UilGrids size="18" />
          </button>
          <button
            className={`${styles.btn} ${columns === 4 ? styles.active : ''}`}
            onClick={() => onColumnsChange(4)}
            aria-label="4 columnas"
            title="4 columnas"
          >
            <UilTh size="18" />
          </button>
          <button
            className={`${styles.btn} ${columns === 5 ? styles.active : ''}`}
            onClick={() => onColumnsChange(5)}
            aria-label="5 columnas"
            title="5 columnas"
          >
            <UilGrid size="18" />
          </button>
        </div>
      )}

      {/* Divisor */}
      {viewMode === 'grid' && <div className={styles.divider} />}

      {/* Grid / Lista */}
      <div className={styles.group}>
        <button
          className={`${styles.btn} ${viewMode === 'grid' ? styles.active : ''}`}
          onClick={() => onViewChange('grid')}
          aria-label="Vista en cuadrícula"
          title="Cuadrícula"
        >
          <UilTh size="18" />
        </button>
        <button
          className={`${styles.btn} ${viewMode === 'list' ? styles.active : ''}`}
          onClick={() => onViewChange('list')}
          aria-label="Vista en lista"
          title="Lista"
        >
          <UilListUl size="18" />
        </button>
      </div>

    </div>
  )
}