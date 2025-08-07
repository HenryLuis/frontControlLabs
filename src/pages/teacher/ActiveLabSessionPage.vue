<template>
  <q-page padding>
    <!-- Muestra un esqueleto mientras 'loading' es true -->
    <template v-if="loading">
      <q-card-section>
        <q-skeleton type="text" class="text-h4" />
        <q-skeleton type="text" class="text-subtitle1" />
      </q-card-section>
      <q-markup-table>
        <thead>
          <tr>
            <th v-for="n in 3" :key="n" class="text-left"><q-skeleton type="text" /></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in 5" :key="n">
            <td v-for="m in 3" :key="m" class="text-left"><q-skeleton type="text" /></td>
          </tr>
        </tbody>
      </q-markup-table>
    </template>

    <!-- Muestra los datos solo si 'loading' es false Y 'session' y 'session.course' existen -->
    <template v-else-if="session && session.course">
      <div class="row items-center justify-between">
        <div>
          <div class="text-h4">{{ session.course.subject.name }}</div>
          <div class="text-subtitle1 text-grey-8">
            {{ session.classroom.name }} - {{ session.session_date }}
          </div>
        </div>
        <!-- Botón para Docente -->
    <q-btn v-if="authStore.hasRole('Docente') && session.status === 'open'" color="negative" icon="stop_circle" label="Finalizar Sesión" @click="handleCloseSession" :loading="isClosing" />

    <!-- Botón para Control Interno -->
    <q-btn v-if="authStore.hasRole('Control Interno') && session.status === 'closed' && !session.reviewed_at" color="positive" icon="check_circle" label="Marcar como Revisado" @click="handleMarkAsReviewed" :loading="isReviewing" />

    <!-- Chip de Estado -->
    <q-chip v-if="session.status === 'closed' && !session.reviewed_at && !authStore.hasRole('Control Interno')" color="orange" text-color="white" icon="pending">Pendiente de Revisión</q-chip>
    <q-chip v-if="session.reviewed_at" color="green" text-color="white" icon="verified">Sesión Revisada</q-chip>
        <q-chip v-else color="green" text-color="white" icon="check_circle">
          Sesión Finalizada
        </q-chip>
      </div>

      <q-separator class="q-my-md" />

      <div class="text-h6 q-mb-sm">Asistencias Registradas ({{ session.attendances.length }})</div>
      <q-table :rows="session.attendances" :columns="attendanceColumns" row-key="id" flat bordered hide-bottom />

      <div class="q-mt-xl">
        <div class="text-h6 q-mb-sm">Observaciones</div>
        <q-list v-if="session.observations && session.observations.length > 0" bordered separator>
          <q-item v-for="obs in session.observations" :key="obs.id">
            <q-item-section>
              <q-item-label caption>{{ obs.user.name }} - {{ formatDate(obs.created_at) }}</q-item-label>
              <q-item-label>{{ obs.observation }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-banner v-else>No hay observaciones para esta sesión.</q-banner>
      </div>
    </template>

    <!-- Muestra un error si 'loading' es false Y 'session' no existe -->
    <q-banner v-else class="bg-warning">
      No se pudo encontrar la sesión de laboratorio o hubo un error al cargarla.
    </q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { labSessionApi } from 'src/api/labSessions'
import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()

const isReviewing = ref(false)

const $q = useQuasar()
const route = useRoute()

const session = ref(null)
const loading = ref(true)
const isClosing = ref(false)

const attendanceColumns = [
  { name: 'student_name', label: 'Estudiante', field: row => row.student.name, align: 'left', sortable: true },
  { name: 'pc_number', label: 'Número PC', field: 'pc_number', align: 'left', sortable: true },
]

const formatDate = (timestamp) => {
  return date.formatDate(timestamp, 'DD/MM/YYYY HH:mm')
}

// --- FUNCIÓN PARA CARGAR LOS DATOS DE UNA SESIÓN ESPECÍFICA ---
const loadSessionData = async (id) => {
  loading.value = true
  session.value = null
  try {
    // Llamamos a la API para obtener los datos de UNA sesión por su ID
    const response = await labSessionApi.getById(id)
    session.value = response.data.data
  } catch (error) {
    console.error(`Error al cargar la sesión ${id}:`, error)
    $q.notify({ color: 'negative', message: 'No se pudo cargar la información de la sesión.' })
  } finally {
    loading.value = false
  }
}

// Carga los datos cuando el componente se monta por primera vez
onMounted(() => {
  loadSessionData(route.params.id)
})

// Observa cambios en el ID de la ruta y recarga los datos si es necesario
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId && newId) {
      loadSessionData(newId)
    }
  }
)

const handleCloseSession = () => {
  const sessionId = route.params.id
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de que deseas finalizar esta sesión? Una vez cerrada, ningún estudiante más podrá registrar su asistencia.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    isClosing.value = true
    try {
      await labSessionApi.close(sessionId)
      $q.notify({ color: 'positive', message: 'Sesión finalizada con éxito.' })
      if (session.value) {
        session.value.status = 'closed'
      }
    } catch (error) {
      console.error('Error al cerrar la sesión:', error)
      const errorMessage = error.response?.data?.message || 'Ocurrió un error.'
      $q.notify({ color: 'negative', message: errorMessage })
    } finally {
      isClosing.value = false
    }
  })
}

const handleMarkAsReviewed = () => {
  $q.dialog({
    title: 'Confirmar Revisión',
    message: '¿Estás seguro de que deseas marcar esta sesión como revisada?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    isReviewing.value = true
    try {
      // El backend devuelve la sesión actualizada
      const response = await labSessionApi.review(session.value.id)
      // Actualizamos nuestro estado local con la respuesta
      session.value = response.data.data
      $q.notify({ color: 'positive', message: 'Sesión marcada como revisada.' })
    } catch (error) {
      console.error('Error al marcar como revisado:', error)
      $q.notify({ color: 'negative', message: 'Ocurrió un error.' })
    } finally {
      isReviewing.value = false
    }
  })
}
</script>
