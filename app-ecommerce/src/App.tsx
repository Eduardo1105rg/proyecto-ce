import { HashRouter, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'
import { useTheme } from './hooks/useTheme'
import { Footer } from './components/Footer/Footer'
import { Route } from "react-router-dom";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CatalogPage } from "./pages/CatalogPage";

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <HashRouter>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
      </Routes>
      <Footer />
    </HashRouter>
  )
}

export default App