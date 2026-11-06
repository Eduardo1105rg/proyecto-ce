import { HashRouter, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'
import { useTheme } from './hooks/useTheme'
import { Footer } from './components/Footer/Footer'
import { Route } from "react-router-dom";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop'
import { CarritoProvider } from './context/CarritoProvider'
import { CartPage } from './pages/CartPage/CartPage'
import { CheckoutPage } from "./pages/CheckoutPage/CheckoutPage";
import { PoliciesPage } from './pages/PoliciesPage/PoliciesPage'
import { AuthProvider } from './features/auth/AuthProvider'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { RutaProtegida } from './features/auth/components/RutaProtegida/RutaProtegida'
import { AnalyticsPage } from './pages/AnalyticsPage/AnalyticsPage'

function App() {
	const { theme, toggleTheme } = useTheme()

	return (
		<HashRouter>
			<AuthProvider>
				{/* Se agrega lo del Provider por encima de todo para que este disponibles al recargar las paginas. */}
				<CarritoProvider>
					<Navbar theme={theme} onToggleTheme={toggleTheme} />
					<ScrollToTop />
					<Routes>
						<Route path="/" element={<CatalogPage />} />
						<Route path="/catalogo" element={<CatalogPage />} />
						<Route path="/producto/:id" element={<ProductDetailPage />} />
						<Route
							path="/carrito"
							element={
								<RutaProtegida roles={['B2C', 'B2B']}>
									<CartPage />
								</RutaProtegida>
							}
						/>
						<Route
							path="/checkout"
							element={
								<RutaProtegida roles={['B2C', 'B2B']}>
									<CheckoutPage />
								</RutaProtegida>
							}
						/>
						<Route
							path="/analytics"
							element={
								<RutaProtegida roles={['B2C', 'B2B', 'ADMIN']}>
									<AnalyticsPage />
								</RutaProtegida>
							}
						/>
						<Route path="/login" element={<LoginPage />} />
						<Route path="/politicas" element={<PoliciesPage />} />
						<Route path="/politicas/:slug" element={<PoliciesPage />} />
					</Routes>
					<Footer />
				</CarritoProvider>
			</AuthProvider>
		</HashRouter>
	)
}

export default App