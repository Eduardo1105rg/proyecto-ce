import styles from './Footer.module.css'
import logo from '../../assets/LogoNaranga.png'
import { Link } from 'react-router-dom'

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
          <p className={styles.tagline}>Su tienda de confiancia en línea para todo lo que necesite.</p>
        </div>

        {/* Links */}
        <div className={styles.links}>
          <span className={styles.linksTitle}>Información</span>
          <Link to="/" className={styles.link}>Catálogo</Link>
          <a href="#" className={styles.link}>Sobre nosotros</a>
          <a href="#" className={styles.link}>Contacto</a>
          <a href="#" className={styles.link}>Términos y condiciones</a>
        </div>

      </div>

      {/* Copyright */}
      <div className={styles.bottom}>
        <p className={styles.copy}>© {year} MarketByte. Todos los derechos reservados.</p>
      </div>

    </footer>
  )
}