import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Utility function to handle dynamic import errors
const lazyLoadView = (importFunc: () => Promise<any>) => {
  return () =>
    importFunc().catch((error) => {
      console.error('Failed to load chunk:', error)
      
      // Check if it's a chunk load error
      if (
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.name === 'TypeError'
      ) {
        // Clear any stale cache and reload
        console.warn('Detected stale chunk, reloading page...')
        window.location.reload()
      }
      
      // Re-throw for other errors
      throw error
    })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      component: lazyLoadView(() => import('@/layouts/AuthLayout.vue')),
      children: [
        {
          path: '',
          redirect: '/auth/login',
        },
        {
          path: 'login',
          name: 'login',
          component: lazyLoadView(() => import('@/views/auth/AuthPage.vue')),
          meta: { requiresGuest: true },
        },
      ],
    },
    {
      path: '/',
      component: lazyLoadView(() => import('@/layouts/DashboardLayout.vue')),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: lazyLoadView(() => import('@/views/dashboard/DashboardHome.vue')),
        },
        {
          path: 'projects',
          name: 'projects',
          component: lazyLoadView(() => import('@/views/projects/ProjectsList.vue')),
        },
        {
          path: 'projects/create',
          name: 'projects-create',
          component: lazyLoadView(() => import('@/views/projects/ProjectCreate.vue')),
          meta: { requiresRole: ['admin', 'project_manager'] },
        },
        {
          path: 'projects/:id',
          name: 'project-details',
          component: lazyLoadView(() => import('@/views/projects/ProjectDetails.vue')),
        },
        {
          path: 'projects/:id/edit',
          name: 'project-edit',
          component: lazyLoadView(() => import('@/views/projects/ProjectEdit.vue')),
          meta: { requiresRole: ['admin', 'project_manager'] },
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: lazyLoadView(() => import('@/views/tasks/TasksBoard.vue')),
        },
        {
          path: 'documents',
          name: 'documents',
          component: lazyLoadView(() => import('@/views/documents/DocumentsList.vue')),
        },
        {
          path: 'reports',
          name: 'reports',
          component: lazyLoadView(() => import('@/views/reports/ReportsPage.vue')),
        },
        {
          path: 'users',
          name: 'users',
          component: lazyLoadView(() => import('@/views/users/UsersList.vue')),
          meta: { requiresRole: ['admin'] },
        },
        {
          path: 'settings',
          name: 'settings',
          component: lazyLoadView(() => import('@/views/settings/SettingsPage.vue')),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: lazyLoadView(() => import('@/views/NotFound.vue')),
    },
  ],
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  // Check role-based access
  if (to.meta.requiresRole) {
    const requiredRoles = to.meta.requiresRole as string[]
    const userRole = authStore.userRole

    if (!userRole || !requiredRoles.includes(userRole)) {
      next({ name: 'dashboard' })
      return
    }
  }

  next()
})

export default router