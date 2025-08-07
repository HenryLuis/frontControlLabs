<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Sesiones de Laboratorio Abiertas</div>

    <div v-if="loading" class="flex flex-center q-mt-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <q-banner v-else-if="!loading && openSessions.length === 0" class="bg-blue-1 text-grey-8">
      <template v-slot:avatar>
        <q-icon name="info" color="info" />
      </template>
      No hay sesiones de laboratorio abiertas en las que necesites registrar tu asistencia.
    </q-banner>

    <q-list v-else bordered separator>
      <q-item v-for="session in openSessions" :key="session.id" class="q-py-md">
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ session.course.subject.name }}</q-item-label>
          <q-item-label caption>
            Docente: {{ session.course.teacher.name }} | Aula: {{ session.classroom.name }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center q-gutter-sm">
            <q-btn
              color="primary"
              label="Asistencia"
              icon="how_to_reg"
              @click="openAttendanceDialog(session)"
              unelevated
              padding="xs md"
              :disable="session.currentUserHasAttended"
            >
              <q-tooltip v-if="session.currentUserHasAttended">Ya has registrado tu asistencia</q-tooltip>
            </q-btn>
            <q-btn
              color="grey-7"
              label="Observación"
              icon="comment"
              @click="openObservationDialog(session)"
              outline
              padding="xs md"
              :disable="session.currentUserHasObserved"
            >
              <q-tooltip v-if="session.currentUserHasObserved">Ya has añadido una observación</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Diálogo para registrar asistencia -->
    <q-dialog v-model="dialogVisible">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Registrar Asistencia</div>
          <div class="text-subtitle2" v-if="selectedSession">{{ selectedSession.course?.subject?.name }}</div>
        </q-card-section>

        <q-form @submit.prevent="handleRegisterAttendance">
          <q-card-section>
            <q-input label="Estudiante" :model-value="authStore.user?.name" filled readonly />
            <q-input
              v-model="attendanceData.pc_number"
              label="Número de PC o Laptop"
              filled
              class="q-mt-md"
              lazy-rules
              :rules="[val => !!val || 'El número de PC es requerido']"
            />

            <div class="q-mt-md">
              <div class="row items-center justify-between">
                <p class="q-mb-sm text-grey-8">Firma:</p>
                <q-btn flat dense color="primary" label="Limpiar" @click="clearSignature" tabindex="-1" />
              </div>
              <VueSignaturePad
                ref="signaturePad"
                width="100%"
                height="200px"
                class="signature-pad"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn type="submit" label="Registrar" color="primary" :loading="isSubmitting" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Diálogo para añadir observación -->
    <q-dialog v-model="observationDialogVisible">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Añadir Observación</div>
          <div v-if="selectedSession" class="text-subtitle2">Sesión de: {{ selectedSession.course?.subject?.name }}</div>
        </q-card-section>
        <q-form @submit.prevent="handleRegisterObservation">
          <q-card-section>
            <q-input
              v-model="observationData.observation"
              label="Escribe tu observación..."
              type="textarea"
              filled
              autofocus
              counter
              maxlength="500"
              lazy-rules
              :rules="[val => !!val && val.length > 3 || 'La observación es requerida.']"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn type="submit" label="Guardar" color="primary" :loading="isSubmittingObservation" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.signature-pad {
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { labSessionApi } from 'src/api/labSessions'
import VueSignaturePad from 'vue3-signature'

const $q = useQuasar()
const authStore = useAuthStore()

const openSessions = ref([])
const loading = ref(true)

const loadOpenSessions = async () => {
  loading.value = true
  try {
    const response = await labSessionApi.fetch({ status: 'open' })
    openSessions.value = response.data.data.filter(session => !session.currentUserHasAttended)
  } catch (error) {
    console.error('Error al cargar sesiones abiertas:', error)
    $q.notify({ color: 'negative', message: 'No se pudieron cargar las sesiones.' })
  } finally {
    loading.value = false
  }
}

onMounted(loadOpenSessions)

// --- Lógica del Diálogo de Asistencia ---
const dialogVisible = ref(false)
const isSubmitting = ref(false)
const selectedSession = ref(null)
const signaturePad = ref(null) // Ref para el componente de firma
const attendanceData = ref({
  pc_number: '',
  student_signature: ''
})

const openAttendanceDialog = (session) => {
  selectedSession.value = session
  attendanceData.value.pc_number = ''
  attendanceData.value.student_signature = ''
  dialogVisible.value = true
  // Retrasamos la limpieza para asegurar que el componente esté renderizado
  setTimeout(() => signaturePad.value?.clear(), 100)
}

const clearSignature = () => {
  signaturePad.value?.clear()
}

const handleRegisterAttendance = async () => {
  const signatureData = signaturePad.value.save();

  // Verificamos si el pad de firma está vacío
  if (signaturePad.value.isEmpty()) {
    $q.notify({ color: 'negative', message: 'Por favor, proporciona tu firma.' });
    return;
  }

  // Guardamos la firma en formato base64. El método save() por defecto devuelve 'image/png'.
  attendanceData.value.student_signature = signatureData;
  // -----------------------

  isSubmitting.value = true;
  try {
    await labSessionApi.addAttendance(selectedSession.value.id, attendanceData.value);

    $q.notify({
      color: 'positive',
      message: '¡Asistencia registrada con éxito!'
    });

    dialogVisible.value = false;

    openSessions.value = openSessions.value.filter(s => s.id !== selectedSession.value.id);

  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    const errorMessage = error.response?.data?.message || 'Ocurrió un error.';
    $q.notify({ color: 'negative', message: errorMessage });
  } finally {
    isSubmitting.value = false;
  }
}

// --- Lógica del Diálogo de Observaciones ---
const observationDialogVisible = ref(false)
const isSubmittingObservation = ref(false)
const observationData = ref({ observation: '' })

const openObservationDialog = (session) => {
  selectedSession.value = session
  observationData.value.observation = ''
  observationDialogVisible.value = true
}

const handleRegisterObservation = async () => {
  isSubmittingObservation.value = true
  try {
    await labSessionApi.addObservation(selectedSession.value.id, observationData.value)
    $q.notify({ color: 'positive', message: 'Observación guardada con éxito.' })
    observationDialogVisible.value = false

    // Actualizamos el estado para deshabilitar el botón de observación.
    const sessionToUpdate = openSessions.value.find(s => s.id === selectedSession.value.id)
    if (sessionToUpdate) {
      sessionToUpdate.currentUserHasObserved = true
    }

  } catch (error) {
    console.error('Error al guardar la observación:', error)
    const errorMessage = error.response?.data?.message || 'Ocurrió un error.'
    $q.notify({ color: 'negative', message: errorMessage })
  } finally {
    isSubmittingObservation.value = false
  }
}
</script>
