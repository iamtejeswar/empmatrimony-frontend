// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import { useSelector } from 'react-redux';
import GoogleSuccessPage from './pages/GoogleSuccessPage';
import WhoViewedMePage from './pages/WhoViewedMePage';
import ChatPage from './pages/ChatPage';
// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfileCompletePage from './pages/ProfileCompletePage';
import SearchPage from './pages/SearchPage';
import ProfileViewPage from './pages/ProfileViewPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import InterestsPage from './pages/InterestsPage';
// Layout
import MainLayout from './components/layout/MainLayout';
// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (isAuthenticated) {
    return <Navigate to={user?.isProfileComplete ? '/dashboard' : '/profile/complete'} replace />;
  }
  return children;
};
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile/complete" element={<ProtectedRoute><ProfileCompletePage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><ProfileViewPage /></ProtectedRoute>} />
          <Route path="/interests" element={<ProtectedRoute><InterestsPage /></ProtectedRoute>} />
        </Route>
        <Route path="/auth/google/success" element={<GoogleSuccessPage />} />
        {/* Admin Routes */}
        <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
          <Route path="/who-viewed-me" element={<WhoViewedMePage />} />
<Route path="/chat" element={<ChatPage />} />
<Route path="/chat/:conversationId" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}
function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1a1a2e', color: '#fff', borderRadius: '12px', border: '1px solid rgba(200,150,45,0.3)' },
          success: { iconTheme: { primary: '#c8962d', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </Provider>
  );
}
export default App;
