import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

import DashboardLayout from './pages/DashboardLayout';
import StartPage from './pages/StartPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import EquipmentDetail from './pages/EquipmentDetail';
import BookingForm from './pages/BookingForm';
import PaymentForm from './pages/PaymentForm';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyRentals from './pages/MyRentals';
import OrderHistory from './pages/OrderHistory';

// Admin components
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminProductDetail from './pages/admin/ProductDetail';
import AdminCategories from './pages/admin/Categories';
import AdminProductImageUpload from './pages/admin/AdminProductImageUpload';
import ReviewManagement from './pages/admin/ReviewManagement';
import ReviewList from './pages/ReviewList';
import ReviewForm from './pages/ReviewForm';

const theme = createTheme({
  palette: {
    primary: { main: '#667eea', light: '#9F7AEA', dark: '#553C9A' },
    secondary: { main: '#F56565' },
    background: { default: '#f7fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

function App() {
  return (
    <GoogleOAuthProvider clientId='1002324308191-1e5r19msbehhnuo7sjrij0dpcmboc19c.apps.googleusercontent.com'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/start" element={<StartPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Login />} />
            {/* Routes with DashboardLayout */}
            <Route element={<DashboardLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/equipment/:id" element={<EquipmentDetail />} />
              <Route path="/booking/:equipmentId" element={<BookingForm />} />
              <Route path="/payment/:bookingId" element={<PaymentForm />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-rentals" element={<MyRentals />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/products/:productId/review" element={<ReviewList />} />
              <Route path="/products/:productId/review/new" element={<ReviewForm />} />

              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/upload-image" element={<AdminProductImageUpload />} />
              <Route path="/admin/reviews/:productId" element={<ReviewManagement />}/>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
