import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAccessToken } from '@/shared/api/client'
import { AppShell } from '@/layouts/AppShell'
import { AuthLayout } from '@/layouts/AuthLayout'
import { SuperAdminShell } from '@/layouts/SuperAdminShell'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { InventoryPage } from '@/features/inventory/InventoryPage'
import { PurchasesPage } from '@/features/purchases/PurchasesPage'
import { SuppliersPage } from '@/features/purchases/SuppliersPage'
import { PosPage } from '@/features/pos/PosPage'
import { SalesPage } from '@/features/sales/SalesPage'
import { ReturnsPage } from '@/features/sales/ReturnsPage'
import { CustomersPage } from '@/features/customers/CustomersPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { UsersPage } from '@/features/settings/UsersPage'
import { SubscriptionPage } from '@/features/subscription/SubscriptionPage'
import { FinancePage } from '@/features/finance/FinancePage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { PromotionsPage } from '@/features/advanced/PromotionsPage'
import { BranchesPage } from '@/features/advanced/BranchesPage'
import { AdvancedInventoryPage } from '@/features/advanced/AdvancedInventoryPage'
import { EmployeesPage } from '@/features/advanced/EmployeesPage'
import { SuperAdminLogin } from '@/features/super-admin/SuperAdminLogin'
import { SuperAdminDashboard } from '@/features/super-admin/SuperAdminDashboard'
import { RetailersPage } from '@/features/super-admin/RetailersPage'
import { PlansPage } from '@/features/super-admin/PlansPage'
import type { RouteObject } from 'react-router-dom'

function RequireAuth() {
  const location = useLocation()
  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

function isSuperAdminToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!)) as { type?: string }
    return payload.type === 'super_admin_access_token'
  } catch {
    return false
  }
}

function GuestOnly() {
  const token = getAccessToken()
  if (!token) return <Outlet />
  if (isSuperAdminToken(token)) {
    return <Navigate to="/super-admin" replace />
  }
  return <Navigate to="/" replace />
}

export const routes: RouteObject[] = [
  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  { path: '/onboarding', element: <OnboardingWizard /> },
  { path: '/super-admin/login', element: <SuperAdminLogin /> },
  {
    path: '/super-admin',
    element: <SuperAdminShell />,
    children: [
      { index: true, element: <SuperAdminDashboard /> },
      { path: 'retailers', element: <RetailersPage /> },
      { path: 'plans', element: <PlansPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'pos', element: <PosPage /> },
          { path: 'sales', element: <SalesPage /> },
          { path: 'returns', element: <ReturnsPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/new', element: <Navigate to="/products" replace /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'inventory/advanced', element: <AdvancedInventoryPage /> },
          { path: 'purchases', element: <PurchasesPage /> },
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'finance', element: <FinancePage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'employees', element: <EmployeesPage /> },
          { path: 'promotions', element: <PromotionsPage /> },
          { path: 'branches', element: <BranchesPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'subscription', element: <SubscriptionPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
