const routes = [
  // Ruta para el Login (pública)
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue')
  },
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
      }
      /* {
        path: 'lab-sessions/:id', // Ruta dinámica con el ID
        name: 'admin-active-lab-session',
        component: () => import('pages/teacher/ActiveLabSessionPage.vue'), // La página que construiremos después
        meta: { requiresAuth: true }
      } */
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
