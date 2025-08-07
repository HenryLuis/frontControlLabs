<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          Control de Laboratorios
        </q-toolbar-title>
        <!-- Botón de Logout -->
        <q-btn flat icon="logout" label="Salir" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Menú Principal
        </q-item-label>

        <!-- Itera sobre nuestra lista de enlaces -->
        <template v-for="link in menuLinks" :key="link.title">
          <!-- Renderiza el enlace solo si el usuario tiene el permiso requerido -->
          <q-item v-if="isVisible(link)" :to="link.link" clickable v-ripple>
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <!-- Aquí se renderizarán las páginas (Dashboard, Aulas, etc.) -->
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const leftDrawerOpen = ref(false)

const isVisible = (link) => {
  if (link.permission && !authStore.can(link.permission)) {
    return false
  }
  if (link.role && !authStore.hasRole(link.role)) {
    return false
  }
  return true
}

// Define aquí todos los enlaces de tu menú
const menuLinks = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    link: '/admin',
    permission: 'view-dashboard' // Inventa un permiso si es necesario
  },
  {
    title: 'Aulas',
    icon: 'class',
    link: '/admin/classrooms',
    permission: 'manage-classrooms'
  },
  {
    title: 'Materias',
    icon: 'book',
    link: '/admin/subjects',
    permission: 'manage-subjects'
  },
  {
    title: 'Nueva Sesión Lab.',
    icon: 'add_circle',
    link: '/admin/lab-sessions/new',
    permission: 'create-lab-session', // <-- Clave para la visibilidad
    role: 'Docente'
  },
  {
    title: 'Registrar Asistencia',
    icon: 'how_to_reg',
    link: '/admin/lab-sessions/open',
    permission: 'create-lab-session', // Mismo permiso que para crear
    role: 'Estudiante'
  },
  /* {
    path: 'lab-sessions/:id', // <-- Ruta dinámica que acepta un ID
    name: 'admin-active-lab-session',
    component: () => import('pages/teacher/ActiveLabSessionPage.vue'),
    meta: { requiresAuth: true } // Abierta a roles con sesión, la lógica interna controlará el acceso
  }, */
  {
    title: 'Mis Sesiones',
    icon: 'pending_actions',
    link: '/admin/my-sessions',
    role: 'Docente' // O el permiso que decidas
  },
  {
    title: 'Mis Cursos',
    icon: 'school',
    link: '/admin/my-courses',
    role: 'Docente'
  },
  {
    title: 'Revisar Sesiones',
    icon: 'fact_check',
    link: '/admin/review-sessions',
    role: 'Control Interno'
  },
  {
    title: 'Gestionar Usuarios',
    icon: 'manage_accounts',
    link: '/admin/users',
    permission: 'manage-users' // <-- Permiso del Admin
  },
  {
    title: 'Gestionar Cursos',
    icon: 'category',
    link: '/admin/courses',
    permission: 'manage-users' // Un permiso de Admin
  }
  // Añade aquí futuros enlaces (Materias, Sesiones, etc.)
]

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
