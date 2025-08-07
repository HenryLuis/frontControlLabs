const routes = [
  // Ruta para el Login (pública)
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue')
  },
  /* {
    path: '/reset-password',
    name: 'reset-password', // Le damos un nombre para que coincida con la configuración del backend
    component: () => import('pages/ResetPasswordPage.vue') // Crearemos esta página después
  }, */
  // Rutas de Administración (protegidas)
  {
    /* path: '/',
    component: () => import('layouts/MainLayout.vue'), */
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'classrooms',
        name: 'admin-classrooms',
        component: () => import('pages/admin/ClassroomsPage.vue'),
        meta: { requiresAuth: true, permission: 'manage-classrooms' }
      },
      {
        path: 'subjects',
        name: 'admin-subjects',
        component: () => import('pages/admin/SubjectsPage.vue'),
        meta: { requiresAuth: true, permission: 'manage-subjects' }
      },
      {
        path: 'lab-sessions/new',
        name: 'admin-new-lab-session',
        component: () => import('pages/teacher/NewLabSessionPage.vue'),
        meta: { requiresAuth: true, permission: 'create-lab-session' }
      },
      {
        path: 'lab-sessions/open',
        name: 'admin-open-lab-sessions',
        component: () => import('pages/student/OpenLabSessionsPage.vue'),
        meta: { requiresAuth: true, permission: 'create-lab-session' }
      },
      {
        path: 'lab-sessions/:id', // Ruta dinámica con el ID
        name: 'admin-active-lab-session',
        component: () => import('pages/teacher/ActiveLabSessionPage.vue'), // La página que construiremos después
        meta: { requiresAuth: true }
      },
      {
        path: 'my-sessions',
        name: 'admin-my-sessions',
        component: () => import('pages/teacher/MySessionsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'my-courses',
        name: 'admin-my-courses',
        component: () => import('pages/teacher/MyCoursesPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'courses/:id', // Ruta dinámica para el detalle
        name: 'admin-course-management',
        component: () => import('pages/teacher/CourseManagementPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'review-sessions',
        name: 'admin-review-sessions',
        component: () => import('pages/internal/ReviewSessionsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('pages/admin/UsersPage.vue'),
        meta: { requiresAuth: true, permission: 'manage-users' }
      },
      {
        path: 'courses',
        name: 'admin-courses',
        component: () => import('pages/admin/CoursesPage.vue'),
        meta: { requiresAuth: true, permission: 'manage-users' }
      }
    ],
    meta: { requiresAuth: true }
  },
  // Redirección por defecto: si el usuario va a la raíz, lo mandamos al login.
  {
    path: '/',
    redirect: '/login'
  },

  // Ruta para errores 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
