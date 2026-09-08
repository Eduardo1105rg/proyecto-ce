import { HashRouter, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'
import { useTheme } from './hooks/useTheme'
import { ButtonTest } from './pages/ButtonTest'
import { ProductTest } from './pages/ProductTest'
import { Footer } from './components/Footer/Footer'
import {Route} from "react-router-dom";
import {ProductDetailPage} from "./pages/ProductDetailPage";
import {CatalogPage} from "./pages/CatalogPage";

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <HashRouter>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/test" element={<ButtonTest />} />
        <Route path="/test" element={<ProductTest />} />
        <Route path="/" element={<CatalogPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
      </Routes>
      <Footer />
    </HashRouter>
  )
}

export default App