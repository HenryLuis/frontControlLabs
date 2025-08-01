<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card class="q-pa-md shadow-2" style="width: 400px">
          <q-card-section>
            <div class="text-h5 text-center q-mb-md">Iniciar Sesión</div>
          </q-card-section>

          <q-form @submit.prevent="handleLogin">
            <q-card-section>
              <q-input
                v-model="form.email"
                label="Correo Electrónico"
                type="email"
                filled
                lazy-rules
                :rules="[val => !!val || 'El correo es requerido']"
              />
              <q-input
                v-model="form.password"
                label="Contraseña"
                type="password"
                filled
                class="q-mt-md"
                lazy-rules
                :rules="[val => !!val || 'La contraseña es requerida']"
              />
            </q-card-section>

            <q-card-actions class="q-px-md">
              <q-btn
                :loading="loading"
                type="submit"
                color="primary"
                label="Ingresar"
                class="full-width"
                size="lg"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore' // Asegúrate de que la ruta sea correcta
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const form = ref({
  email: 'admin@ejemplo.com', // Pre-llenado para pruebas rápidas
  password: 'password'
})
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    await authStore.login(form.value)
    // Redirige al dashboard o a la página principal después del login
    router.push('/admin')
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error.message || 'Error al iniciar sesión. Verifique sus credenciales.'
    })
  } finally {
    loading.value = false
  }
}
</script>
