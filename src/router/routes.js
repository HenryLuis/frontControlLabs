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
