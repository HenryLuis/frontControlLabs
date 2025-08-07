// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios' // Nuestra instancia de Axios

export const useAuthStore = defineStore('auth', () => {
  // =================================================================
  // STATE (Propiedades reactivas)
  // =================================================================
  const user = ref(null)

  // =================================================================
  // GETTERS (Propiedades computadas basadas en el state)
  // =================================================================
  const isAuthenticated = computed(() => !!user.value)
  const permissions = computed(() => user.value?.permissions || [])
  const roles = computed(() => user.value?.roles || []) // <-- NUEVO GETTER

  // =================================================================
  // ACTIONS (Métodos para modificar el state)
  // =================================================================

  /**
   * Inicia sesión, pide el usuario y lo guarda en el state.
   * @param {object} credentials - { email, password }
   */
  const login = async (credentials) => {
    // La ruta de login ahora está prefijada, usamos la URL completa
    await api.post('/login', credentials)
    // Si el login es exitoso, obtenemos los datos del usuario
    await fetchUser()
  }

  /**
   * Cierra la sesión en la API y limpia el state local.
   */
  const logout = async () => {
    await api.post('/logout')
    user.value = null
  }

  /**
   * Obtiene los datos del usuario desde la API y los guarda.
   */
  const fetchUser = async () => {
    try {
      // La ruta del usuario también está prefijada
      const response = await api.get('/user')
      user.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch user:', error.response?.data?.message || error.message)
      user.value = null
    }
  }

  /**
   * Verifica si el usuario tiene un permiso específico.
   * @param {string} permissionName
   */
  const can = (permissionName) => {
    return permissions.value.includes(permissionName)
  }

  /**
   * NUEVO: Verifica si el usuario tiene un rol específico.
   * @param {string} roleName
   */
  const hasRole = (roleName) => {
    return roles.value.includes(roleName)
  }

  // =================================================================
  // EXPORTACIÓN PÚBLICA
  // Todo lo que se devuelve aquí será accesible desde fuera de la store.
  // =================================================================
  return {
    // State
    user,
    // Getters
    isAuthenticated,
    permissions,
    roles,      // <-- EXPONER ROLES
    // Actions
    login,
    logout,
    fetchUser,
    can,
    hasRole     // <-- EXPONER HASROLE
  }
})
