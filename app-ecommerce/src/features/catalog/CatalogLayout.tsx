import styles from './CatalogLayout.module.css'

type CatalogLayoutProps = {
  children: React.ReactNode
  sidebar?: React.ReactNode    // filtros - opcional por ahora
  searchBar?: React.ReactNode  // barra de búsqueda - opcional por ahora
}

export function CatalogLayout({ children, sidebar, searchBar }: CatalogLayoutProps) {
  return (
    <div className={styles.page}>

      {/* Barra de búsqueda - centrada encima del catálogo */}
      {searchBar && (
        <div className={styles.searchRow}>
          {searchBar}
        </div>
      )}

      {/* Contenedor principal: filtros + catálogo */}
      <div className={styles.main}>

        {/* Columna izquierda - filtros */}
        <aside className={`${styles.sidebar} ${!sidebar ? styles.sidebarHidden : ''}`}>
          {sidebar}
        </aside>

        {/* Columna derecha - catálogo */}
        <section className={styles.catalog}>
          {children}
        </section>

      </div>
    </div>
  )
}