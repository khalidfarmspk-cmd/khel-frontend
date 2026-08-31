import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import Layout from './components/Layout'
import OwnerRoute from './components/OwnerRoute'
import ProtectedRoute from './components/ProtectedRoute'
import Categories from './pages/Categories'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Products from './pages/Products'
import Reports from './pages/Reports'
import Suppliers from './pages/Suppliers'
import Units from './pages/Units'
import Users from './pages/Users'
import VegetableSales from './pages/VegetableSales'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/units" element={<Units />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/vegetable-sales" element={<VegetableSales />} />
              <Route element={<OwnerRoute />}>
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
