<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Iniciar Nueva Sesión de Laboratorio</div>
    <q-card>
      <q-form @submit.prevent="handleSubmit">
        <q-card-section class="q-gutter-md">
          <q-input label="Docente" :model-value="authStore.user?.name" filled readonly />

          <!-- Selector para Cursos -->
          <q-select
            filled
            v-model="formData.course_id"
            :options="courseOptions"
            label="Seleccione el Curso"
            emit-value
            map-options
            lazy-rules
            :rules="[val => !!val || 'Debe seleccionar un curso']"
            :loading="loadingCourses"
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
            :loading="loadingClassrooms"
          />

          <!-- Selector para Materias -->
          <!-- <q-select
            filled
            v-model="formData.subject_id"
            :options="subjectOptions"
            label="Seleccione la Materia"
            emit-value
            map-options
            lazy-rules
            :rules="[val => !!val || 'Debe seleccionar una materia']"
          /> -->

          <!-- Selector de Fecha -->
          <q-input filled v-model="formData.session_date" label="Fecha de la Sesión" mask="####-##-##" :rules="[val => !!val || 'La fecha es requerida']">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="formData.session_date" mask="YYYY-MM-DD">
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
import { useQuasar, date } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { classroomApi } from 'src/api/classrooms' // Reutilizamos nuestros servicios
import { courseApi } from 'src/api/courses'
//import { subjectApi } from 'src/api/subjects'   // Reutilizamos nuestros servicios
import { labSessionApi } from 'src/api/labSessions'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

// --- Estado del Formulario ---
const formData = ref({
  course_id: null,
  classroom_id: null,
  session_date: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  start_time: '09:00',
  end_time: '11:00',
})
const isSubmitting = ref(false)

// --- Opciones para los QSelect ---
const courseOptions = ref([])
const classroomOptions = ref([])
const loadingCourses = ref(true)
const loadingClassrooms = ref(true)

// --- Cargar datos para los selectores al montar el componente ---
onMounted(async () => {
  try {
    const teacherId = authStore.user?.id
    if (!teacherId) {
      throw new Error('No se pudo identificar al docente.')
    }

    // Pedimos los cursos del docente y todas las aulas en paralelo
    const [coursesRes, classroomsRes] = await Promise.all([
      courseApi.fetch({ teacher_id: teacherId }),
      classroomApi.fetch({ perPage: -1 })
    ])

    // Mapeamos los datos para QSelect
    courseOptions.value = coursesRes.data.data.map(c => ({
      label: `${c.subject.name} (${c.subject.acronym}) - ${c.semester}`,
      value: c.id
    }))
    classroomOptions.value = classroomsRes.data.data.map(c => ({ label: c.name, value: c.id }))

  } catch (error) {
    console.error('Error al cargar datos del formulario:', error);
    $q.notify({ color: 'negative', message: 'Error al cargar los datos del formulario.' })
  } finally {
    loadingCourses.value = false
    loadingClassrooms.value = false
  }
})

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true
  try {
    const response = await labSessionApi.createHeader(formData.value)
    const newSessionId = response.data.data.id
    $q.notify({
      color: 'positive',
      message: 'Sesión iniciada con éxito.'
    })
    router.push(`/admin/lab-sessions/${newSessionId}`)
  } catch (error) {
    console.error('Error al iniciar la sesión:', error)
    const errorMsg = error.response?.data?.message || 'Ocurrió un error.'
    $q.notify({ color: 'negative', message: errorMsg })
  } finally {
    isSubmitting.value = false
  }
}
</script>
