import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/authStore'

export default boot(async ({ router }) => {
  router.beforeEach(async (to, from, next) => {
    // Llamamos a useAuthStore() directamente
    const authStore = useAuthStore()

    if (authStore.user === null) {
      await authStore.fetchUser()
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'login' })
    } else if (to.name === 'login' && authStore.isAuthenticated) {
      next({ name: 'admin-dashboard' })
    } else {
      next()
    }
  })
})
