import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { ProjectListPage } from '@/pages/ProjectListPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { BOQPage } from '@/pages/BOQPage'
import { MaterialsPage } from '@/pages/MaterialsPage'
import { ActivitySchedulePage } from '@/pages/ActivitySchedulePage'
import { DailyProgressPage } from '@/pages/DailyProgressPage'
import { TeamPage } from '@/pages/TeamPage'
import { ReportsPage } from '@/pages/ReportsPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <ProjectListPage /> },
          { path: 'team', element: <TeamPage /> },
          { path: 'projects/:projectId', element: <ProjectDetailPage /> },
          { path: 'projects/:projectId/boq', element: <BOQPage /> },
          { path: 'projects/:projectId/materials', element: <MaterialsPage /> },
          { path: 'projects/:projectId/schedule', element: <ActivitySchedulePage /> },
          { path: 'projects/:projectId/progress', element: <DailyProgressPage /> },
          { path: 'projects/:projectId/reports', element: <ReportsPage /> },
        ],
      },
    ],
  },
])
