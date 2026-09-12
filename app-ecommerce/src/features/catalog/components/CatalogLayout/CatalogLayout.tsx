import styles from './CatalogLayout.module.css'

/**
 * Props del componente CatalogLayout.
 *
 * @prop children   - Contenido principal del catalogo (grilla de productos, paginacion).
 * @prop sidebar    - Panel de filtros. Opcional; si no se pasa, la columna se oculta.
 * @prop searchBar  - Barra de busqueda. Opcional; si no se pasa, la fila no se renderiza.
 */
type CatalogLayoutProps = {
  children: React.ReactNode
  sidebar?: React.ReactNode
  searchBar?: React.ReactNode
}

/**
 * Layout estructural de la pagina de catalogo.
 *
 * Define la estructura visual en dos zonas:
 * - Fila superior: barra de busqueda centrada (si se provee).
 * - Contenedor principal: columna izquierda de filtros + columna derecha de productos.
 *
 * Si no se pasa sidebar, la columna izquierda se oculta via la clase sidebarHidden.
 * El layout no maneja estado ni logica; solo organiza lo que recibe por props.
 */
export function CatalogLayout({ children, sidebar, searchBar }: CatalogLayoutProps) {
  return (
    <div className={styles.page}>

      {/* Barra de busqueda - centrada encima del catalogo */}
      {searchBar && (
        <div className={styles.searchRow}>
          {searchBar}
        </div>
      )}

      {/* Contenedor principal: filtros + catalogo */}
      <div className={styles.main}>

        {/* Columna izquierda - filtros */}
        <aside className={`${styles.sidebar} ${!sidebar ? styles.sidebarHidden : ''}`}>
          {sidebar}
        </aside>

        {/* Columna derecha - catalogo */}
        <section className={styles.catalog}>
          {children}
        </section>

      </div>
    </div>
  )
}