import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Login from './components/Login'
import GalleryAdmin from './components/GalleryAdmin'
import InquiriesAdmin from './components/InquiriesAdmin'
import ContactsAdmin from './components/ContactsAdmin'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Facilities from './components/Facilities'
import Gallery from './components/Gallery'
import Pricing from './components/Pricing'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/*" element={<PublicApp />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminRoutes />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Public app component
const PublicApp: React.FC = () => {
  const [currentSection, setCurrentSection] = React.useState('home')

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header currentSection={currentSection} setCurrentSection={setCurrentSection} />
      <main>
        <Hero />
        <About />
        <Facilities />
        <Gallery />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

// Admin routes component
const AdminRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/gallery" replace />} />
        <Route path="/gallery" element={<GalleryAdmin />} />
        <Route path="/inquiries" element={<InquiriesAdmin />} />
        <Route path="/contacts" element={<ContactsAdmin />} />
        <Route path="*" element={<Navigate to="/admin/gallery" replace />} />
      </Routes>
    </AdminLayout>
  )
}

export default App