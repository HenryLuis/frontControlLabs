<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Iniciar Nueva Sesión de Laboratorio</div>

    <q-card>
      <q-form @submit.prevent="handleSubmit">
        <q-card-section class="q-gutter-md">
          <!-- El nombre del docente se obtiene del usuario logueado -->
          <q-input
            label="Docente"
            :model-value="authStore.user?.name"
            filled
            readonly
          />

          <!-- Selector para Aulas -->
          <q-select
            filled
            v-model="formData.classroom_id"
            :options="classroomOptions"
            label="Seleccione el Aula"
            emit-value
            map-options
            lazy-rules
            :rules="[val => !!val || 'Debe seleccionar un aula']"
          />

          <!-- Selector para Materias -->
          <q-select
            filled
            v-model="formData.subject_id"
            :options="subjectOptions"
            label="Seleccione la Materia"
            emit-value
            map-options
            lazy-rules
            :rules="[val => !!val || 'Debe seleccionar una materia']"
          />

          <!-- Selector de Fecha -->
          <q-input filled v-model="formData.session_date" label="Fecha de la Sesión" mask="date" :rules="['date']">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="formData.session_date">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Selectores de Hora -->
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input filled v-model="formData.start_time" label="Hora de Inicio" mask="time" :rules="['time']">
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="formData.start_time">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input filled v-model="formData.end_time" label="Hora de Fin" mask="time" :rules="['time']">
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="formData.end_time">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <!-- Campo de Observaciones -->
          <q-input
            v-model="formData.observations"
            label="Observación Inicial (Opcional)"
            type="textarea"
            filled
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn type="submit" label="Iniciar Sesión" color="primary" :loading="isSubmitting" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { classroomApi } from 'src/api/classrooms' // Reutilizamos nuestros servicios
import { subjectApi } from 'src/api/subjects'   // Reutilizamos nuestros servicios
import { labSessionApi } from 'src/api/labSessions'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

// --- Estado del Formulario ---
const formData = ref({
  teacher_id: authStore.user?.id, // El docente es el usuario logueado
  classroom_id: null,
  subject_id: null,
  session_date: new Date().toISOString().substr(0, 10), // Fecha de hoy por defecto
  start_time: '',
  end_time: '',
  observations: ''
})
const isSubmitting = ref(false)

// --- Opciones para los QSelect ---
const classroomOptions = ref([])
const subjectOptions = ref([])

// --- Cargar datos para los selectores al montar el componente ---
onMounted(async () => {
  try {
    // Pedimos TODAS las aulas y materias (sin paginación)
    const [classroomsRes, subjectsRes] = await Promise.all([
      classroomApi.fetch({ perPage: -1 }), // perPage: -1 para traer todos
      subjectApi.fetch({ perPage: -1 })
    ])
    // Mapeamos los datos al formato que QSelect necesita: { label, value }
    classroomOptions.value = classroomsRes.data.data.map(c => ({ label: c.name, value: c.id }))
    subjectOptions.value = subjectsRes.data.data.map(s => ({ label: `${s.name} (${s.acronym})`, value: s.id }))
  } catch (error) {
    console.error('Error al cargar datos para el formulario:', error)
    $q.notify({ color: 'negative', message: 'Error al cargar datos para el formulario.' })
  }
})

// --- Lógica de envío ---
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    //const response = await labSessionApi.createHeader(formData.value)
    //const newSessionId = response.data.data.id
    // La respuesta de la API ya no se guarda en una variable 'response'
    await labSessionApi.createHeader(formData.value)

    $q.notify({
      color: 'positive',
      message: 'Sesión iniciada con éxito. Ahora los estudiantes pueden registrar su asistencia.'
    })

    // TODO: Redirigir a la página de "Sesión en Progreso"
    // router.push(`/admin/lab-sessions/${newSessionId}`)
    // Por ahora, solo limpiamos el formulario o redirigimos a otra página
    router.push('/admin') // O a un dashboard de docente

  } catch (error) {
    console.error('Error al iniciar la sesión:', error)
    $q.notify({ color: 'negative', message: 'Ocurrió un error al iniciar la sesión.' })
  } finally {
    isSubmitting.value = false
  }
}
</script>
