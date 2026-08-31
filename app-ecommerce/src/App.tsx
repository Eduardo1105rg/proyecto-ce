import { HashRouter, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'
import { useTheme } from './hooks/useTheme'
import { ButtonTest } from './pages/ButtonTest'
import { ProductTest } from './pages/ProductTest'


import './App.css'

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <HashRouter>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <ButtonTest />
      <ProductTest />
      <Routes>
        {/* rutas aquí */}
      </Routes>
    </HashRouter>
  )
}

export default App