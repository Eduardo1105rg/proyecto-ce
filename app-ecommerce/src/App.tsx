import { HashRouter, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'
import { useTheme } from './hooks/useTheme'
import { Footer } from './components/Footer/Footer'
import { Route } from "react-router-dom";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop'
import { CarritoProvider } from './context/CarritoProvider'

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <HashRouter>
      {/* Se agrega lo del Provider por encima de todo para que este disponibles al recargar las paginas. */}
      <CarritoProvider>
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
        </Routes>
        <Footer />
      </CarritoProvider>
    </HashRouter>
  )
}

export default App