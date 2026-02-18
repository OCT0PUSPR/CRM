import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/auth'
import { ThemeProvider } from '../context/theme'
import { SidebarProvider, useSidebar } from '../context/sidebar'
import { RTLProvider, useRTL } from './context/rtl'
import Signin from './signin'
import Contacts from './pages/Contacts'
import Leads from './pages/Leads'
import OpportunitiesKanban from './pages/OpportunitiesKanban'
import Companies from './pages/Companies'
import Quotations from './pages/Quotations'
import Activities from './pages/Activities'
import FieldsTesterPage from './fields'
import SalesTeams from './pages/configuration/SalesTeams'
import TeamMembers from './pages/configuration/TeamMembers'
import Personnel from './pages/configuration/personnel'
import ActivityTypes from './pages/configuration/ActivityTypes'
import ActivityPlans from './pages/configuration/ActivityPlans'
import LostReasons from './pages/configuration/LostReasons'
import Stages from './pages/configuration/Stages'
import Tags from './pages/configuration/Tags'
import Dashboard from './pages/Dashboard'
import { CRMSidebar } from './components/CRMSidebar'

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-zinc-400 font-medium">Loading...</p>
      </div>
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}

// Public Route - redirects to contacts if already authenticated
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to="/contacts" replace />
  }

  return <>{children}</>
}

import HeaderNavbar from './components/HeaderNavbar'

// Main Layout with Sidebar - RTL-aware
function MainLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()
  const { isRTL } = useRTL()
  const sidebarWidth = isCollapsed ? 88 : 280

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <CRMSidebar />

      <div
        style={{
          paddingInlineStart: sidebarWidth,
          paddingTop: 56,
        }}
        className="min-h-screen transition-all duration-300"
      >
        <HeaderNavbar sidebarLeft={sidebarWidth} isRTL={isRTL} />
        <main className="min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>
    </div>
  )
}

// Protected Layout - wraps protected routes with sidebar
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        }
      />

      {/* Protected Routes with Sidebar */}
      <Route
        path="/contacts"
        element={
          <ProtectedLayout>
            <Contacts />
          </ProtectedLayout>
        }
      />

      <Route
        path="/leads"
        element={
          <ProtectedLayout>
            <Leads />
          </ProtectedLayout>
        }
      />

      <Route
        path="/opportunities"
        element={
          <ProtectedLayout>
            <OpportunitiesKanban />
          </ProtectedLayout>
        }
      />

      <Route
        path="/companies"
        element={
          <ProtectedLayout>
            <Companies />
          </ProtectedLayout>
        }
      />

      <Route
        path="/quotations"
        element={
          <ProtectedLayout>
            <Quotations />
          </ProtectedLayout>
        }
      />

      <Route
        path="/activities"
        element={
          <ProtectedLayout>
            <Activities />
          </ProtectedLayout>
        }
      />

      <Route
        path="/configuration/fields"
        element={
          <ProtectedLayout>
            <FieldsTesterPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />

      {/* Configuration Routes */}
      <Route
        path="/configuration/personnel"
        element={
          <ProtectedLayout>
            <Personnel />
          </ProtectedLayout>
        }
      />

      <Route
        path="/configuration/sales-teams"
        element={
          <ProtectedLayout>
            <SalesTeams />
          </ProtectedLayout>
        }
      />

      <Route
        path="/configuration/team-members"
        element={
          <ProtectedLayout>
            <TeamMembers />
          </ProtectedLayout>
        }
      />

      <Route
        path="/configuration/activity-types"
        element={
          <ProtectedLayout>
            <ActivityTypes />
          </ProtectedLayout>
        }
      />

      <Route
        path="/configuration/activity-plans"
        element={
          <ProtectedLayout>
            <ActivityPlans />
          </ProtectedLayout>
        }
      />

      <Route
        path="/configuration/lost-reasons"
        element={
          <ProtectedLayout>
            <LostReasons />
          </ProtectedLayout>
        }
      />

      <Route
        path="/configuration/stages"
        element={
          <ProtectedLayout>
            <Stages />
          </ProtectedLayout>
        }
      />

      <Route
        path="/configuration/tags"
        element={
          <ProtectedLayout>
            <Tags />
          </ProtectedLayout>
        }
      />

      {/* Redirects */}
      <Route
        path="/overview"
        element={<Navigate to="/contacts" replace />}
      />
      <Route path="/" element={<Navigate to="/contacts" replace />} />
      <Route path="*" element={<Navigate to="/contacts" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <RTLProvider>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <AppRoutes />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </RTLProvider>
    </BrowserRouter>
  )
}

export default App
