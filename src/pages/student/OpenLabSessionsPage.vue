<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Sesiones de Laboratorio Abiertas</div>

    <q-list bordered separator v-if="!loading && openSessions.length > 0">
      <q-item
        v-for="session in openSessions"
        :key="session.id"
        clickable
        v-ripple
        @click="openAttendanceDialog(session)"
      >
        <q-item-section>
          <q-item-label>{{ session.subject.name }}</q-item-label>
          <q-item-label caption>
            Docente: {{ session.teacher.name }} | Aula: {{ session.classroom.name }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="keyboard_arrow_right" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="loading" class="flex flex-center">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <q-banner v-if="!loading && openSessions.length === 0">
      No hay sesiones de laboratorio abiertas en este momento.
    </q-banner>

    <!-- Diálogo para registrar asistencia -->
    <q-dialog v-model="dialogVisible">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">Registrar Asistencia</div>
          <div class="text-subtitle2">{{ selectedSession.subject?.name }}</div>
        </q-card-section>

        <q-form @submit.prevent="handleRegisterAttendance">
          <q-card-section>
            <q-input
              label="Estudiante"
              :model-value="authStore.user?.name"
              filled
              readonly
            />
            <q-input
              v-model="attendanceData.pc_number"
              label="Número de PC o Laptop"
              filled
              class="q-mt-md"
              lazy-rules
              :rules="[val => !!val || 'El número de PC es requerido']"
            />

            <!-- Aquí iría el componente de firma -->
            <div class="q-mt-md">
              <p>Firma:</p>
              <!--
                Placeholder para el componente de firma.
                Debería emitir la firma en base64 al modelo 'attendanceData.student_signature'
              -->
              <div class="bg-grey-2 q-pa-md text-center">
                [Componente de Firma Digital Aquí]
              </div>
            </div>

          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn type="submit" label="Registrar" color="primary" :loading="isSubmitting" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { labSessionApi } from 'src/api/labSessions'

const $q = useQuasar()
const authStore = useAuthStore()

const openSessions = ref([])
const loading = ref(true)

// --- Cargar las sesiones abiertas al montar ---
onMounted(async () => {
  try {
    const response = await labSessionApi.fetch({ status: 'open' })
    openSessions.value = response.data.data
  } catch (error) {
    console.error('Error al cargar sesiones abiertas:', error)
    $q.notify({ color: 'negative', message: 'No se pudieron cargar las sesiones.' })
  } finally {
    loading.value = false
  }
})

// --- Lógica del Diálogo ---
const dialogVisible = ref(false)
const isSubmitting = ref(false)
const selectedSession = ref(null)
const attendanceData = ref({
  pc_number: '',
  student_signature: '' // Aquí se guardará la firma en base64
})

const openAttendanceDialog = (session) => {
  selectedSession.value = session
  attendanceData.value.pc_number = ''
  attendanceData.value.student_signature = ''
  dialogVisible.value = true
}

const handleRegisterAttendance = async () => {
  isSubmitting.value = true
  try {
    await labSessionApi.addAttendance(selectedSession.value.id, attendanceData.value)
    $q.notify({
      color: 'positive',
      message: '¡Asistencia registrada con éxito!'
    })
    dialogVisible.value = false
    // Opcional: podrías recargar la lista o quitar la sesión de la lista
  } catch (error) {
    console.error('Error al registrar asistencia:', error)
    const errorMessage = error.response?.data?.message || 'Ocurrió un error.'
    $q.notify({ color: 'negative', message: errorMessage })
  } finally {
    isSubmitting.value = false
  }
}
</script>
