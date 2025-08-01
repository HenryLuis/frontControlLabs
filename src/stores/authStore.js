// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios' // Nuestra instancia de Axios

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const user = ref(null) // El objeto del usuario logueado
  const isAuthenticated = computed(() => !!user.value)
  const permissions = computed(() => user.value?.permissions || [])

  // --- ACTIONS ---

  /**
   * Inicia sesión, pide el usuario y lo guarda en el state.
   * @param {object} credentials - { email, password }
   */
  const login = async (credentials) => {
    // Hacemos la petición de login a nuestra API Laravel
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
      const response = await api.get('/user')
      user.value = response.data.data
    } catch (error) {
      // Imprime el error en la consola para depuración
      console.error('Failed to fetch user:', error.response?.data?.message || error.message)
      // Si hay un error (ej. 401 Unauthorized), reseteamos el usuario
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

  // --- RETURN ---
  return {
    user,
    isAuthenticated,
    permissions,
    login,
    logout,
    fetchUser,
    can
  }
})
