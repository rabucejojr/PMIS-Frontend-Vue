import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/auth",
      component: () => import("@/layouts/AuthLayout.vue"),
      children: [
        {
          path: "",
          redirect: "/auth/login",
        },
        {
          path: "login",
          name: "login",
          component: () => import("@/views/auth/AuthPage.vue"),
          meta: { requiresGuest: true },
        },
      ],
    },
    {
      path: "/",
      component: () => import("@/layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          redirect: "/dashboard",
        },
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/views/dashboard/DashboardHome.vue"),
        },
        {
          path: "projects",
          name: "projects",
          component: () => import("@/views/projects/ProjectsList.vue"),
        },
        {
          path: "projects/create",
          name: "projects-create",
          component: () => import("@/views/projects/ProjectCreate.vue"),
          meta: { requiresRole: ["admin", "project_manager"] },
        },
        {
          path: "projects/:id",
          name: "project-details",
          component: () => import("@/views/projects/ProjectDetails.vue"),
        },
        {
          path: "projects/:id/edit",
          name: "project-edit",
          component: () => import("@/views/projects/ProjectEdit.vue"),
          meta: { requiresRole: ["admin", "project_manager"] },
        },
        {
          path: "tasks",
          name: "tasks",
          component: () => import("@/views/tasks/TasksBoard.vue"),
        },
        {
          path: "documents",
          name: "documents",
          component: () => import("@/views/documents/DocumentsList.vue"),
        },
        {
          path: "users",
          name: "users",
          component: () => import("@/views/users/UsersList.vue"),
          meta: { requiresRole: ["admin"] },
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/views/settings/SettingsPage.vue"),
        },
        {
          path: "reports",
          name: "reports",
          component: () => import("@/views/reports/ReportsPage.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: "dashboard" });
    return;
  }

  // Check role-based access
  if (to.meta.requiresRole) {
    const requiredRoles = to.meta.requiresRole as string[];
    const userRole = authStore.userRole;

    if (!userRole || !requiredRoles.includes(userRole)) {
      next({ name: "dashboard" });
      return;
    }
  }

  next();
});

export default router;
