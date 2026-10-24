import styles from './Footer.module.css'
import logo from '../../assets/LogoNaranga.png'
import { Link } from 'react-router-dom'
import { POLICIES } from '../../features/policies/policiesContent'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Logo y descripción */}
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLink}>
            <img src={logo} alt="MarketByte" className={styles.logo} />
            <span className={styles.brandName}>MarketByte</span>
          </Link>
          <p className={styles.tagline}>Su tienda de confianza en línea para todo lo que necesite.</p>
        </div>

        {/* Links */}
        <div className={styles.links}>
          <span className={styles.linksTitle}>Información</span>
          <Link to="/" className={styles.link}>Catálogo</Link>
          <a href="#" className={styles.link}>Sobre nosotros</a>
          <a href="#" className={styles.link}>Contacto</a>
        </div>

        {/* Información comercial */}
        <nav className={styles.links} aria-label="Políticas">
          <span className={styles.linksTitle}>Políticas</span>
          {POLICIES.map((policy) => (
            <Link key={policy.slug} to={`/politicas/${policy.slug}`} className={styles.link}>
              {policy.title}
            </Link>
          ))}
        </nav>

      </div>

      {/* Copyright */}
      <div className={styles.bottom}>
        <p className={styles.copy}>© {year} MarketByte. Todos los derechos reservados.</p>
      </div>

    </footer>
  )
}