import styles from './ViewToggle.module.css'
import { UilListUl, UilGrid, UilTh, UilGrids } from '@iconscout/react-unicons'

/** Modo de visualizacion del catalogo */
type ViewMode = 'grid' | 'list'

/** Numero de columnas permitidas en modo grid */
type Columns = 3 | 4 | 5

/**
 * Props del componente ViewToggle.
 *
 * @prop viewMode        - Modo de visualizacion activo ('grid' o 'list').
 * @prop columns         - Numero de columnas activo en modo grilla (3, 4 o 5).
 * @prop onViewChange    - Callback que recibe el nuevo modo al cambiar entre grilla y lista.
 * @prop onColumnsChange - Callback que recibe el nuevo numero de columnas.
 * @prop hideList        - Si es true, oculta el boton de modo lista. Por defecto: false.
 *                         Util para vistas donde el modo lista no aplica (ej. movil).
 */
type ViewToggleProps = {
  viewMode: ViewMode
  columns: Columns
  onViewChange: (mode: ViewMode) => void
  onColumnsChange: (cols: Columns) => void
  hideList?: boolean
}

/**
 * Control de visualizacion del catalogo.
 *
 * Permite al usuario alternar entre modo grid y modo lista,
 * y seleccionar cuantas columnas mostrar en modo grilla (3, 4 o 5).
 */
export function ViewToggle({ viewMode, columns, onViewChange, onColumnsChange, hideList = false }: ViewToggleProps) {
  return (
    <div className={styles.wrapper}>

      {/* Selector de columnas - visible solo en modo gird */}
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

      {/* Divisor visual entre selector de columnas y selector de modo */}
      {viewMode === 'grid' && <div className={styles.divider} />}

      {/* Selector de modo: grid / lista */}
      <div className={styles.group}>
        <button
          className={`${styles.btn} ${viewMode === 'grid' ? styles.active : ''}`}
          onClick={() => onViewChange('grid')}
          aria-label="Vista en cuadricula"
          title="Cuadricula"
        >
          <UilTh size="18" />
        </button>
        {!hideList && (
          <button
            className={`${styles.btn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => onViewChange('list')}
            aria-label="Vista en lista"
            title="Lista"
          >
            <UilListUl size="18" />
          </button>
        )}
      </div>
    </div>
  )
}