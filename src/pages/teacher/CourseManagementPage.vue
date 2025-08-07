<template>
  <q-page padding>
    <!-- Muestra el esqueleto de carga -->
    <template v-if="loading">
      <q-skeleton type="text" class="text-h4 q-mb-md" />
      <q-skeleton type="text" height="150px" class="q-mt-md" />
      <q-skeleton type="text" height="200px" class="q-mt-lg" />
    </template>

    <!-- Muestra los datos del curso una vez cargados -->
    <template v-else-if="course">
      <div class="text-h4">{{ course.subject.name }}</div>
      <div class="text-subtitle1 text-grey-8">Semestre: {{ course.semester }}</div>
      <q-separator class="q-my-md" />

      <div class="row q-col-gutter-lg">
        <!-- Columna Izquierda: Lista de Estudiantes -->
        <div class="col-12 col-md-7">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Estudiantes Matriculados ({{ course.students.length }})</div>
            </q-card-section>
            <q-table
              :rows="course.students"
              :columns="studentColumns"
              row-key="id"
              flat
              dense
            />
          </q-card>
        </div>

        <!-- Columna Derecha: Formulario para Matricular -->
        <div class="col-12 col-md-5">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Matricular Nuevo Estudiante</div>
            </q-card-section>
            <q-form @submit.prevent="handleEnrollStudent">
              <q-card-section class="q-gutter-md">
                <q-input
                  v-model="newStudentForm.name"
                  label="Nombre Completo del Estudiante"
                  filled
                  lazy-rules
                  :rules="[val => !!val || 'El nombre es requerido']"
                />
                <q-input
                  v-model="newStudentForm.email"
                  label="Correo Electrónico"
                  type="email"
                  filled
                  lazy-rules
                  :rules="[val => !!val || 'El correo es requerido']"
                />
              </q-card-section>
              <q-card-actions class="q-pa-md">
                <q-btn
                  type="submit"
                  label="Matricular"
                  color="primary"
                  :loading="isSubmitting"
                  class="full-width"
                />
              </q-card-actions>
            </q-form>
          </q-card>
        </div>
      </div>
    </template>

    <q-banner v-else class="bg-warning">
      No se pudo encontrar el curso especificado.
    </q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { courseApi } from 'src/api/courses'

const $q = useQuasar()
const route = useRoute()

const courseId = route.params.id
const course = ref(null)
const loading = ref(true)
const isSubmitting = ref(false)
const newStudentForm = ref({ name: '', email: '' })

const studentColumns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'email', label: 'Correo', field: 'email', align: 'left', sortable: true }
]

// Función para cargar/recargar los datos del curso
const loadCourseData = async () => {
  loading.value = true
  try {
    const response = await courseApi.getById(courseId)
    course.value = response.data.data
  } catch (error) {
    console.error('Error al cargar el curso:', error)
    $q.notify({ color: 'negative', message: 'No se pudo cargar la información del curso.' })
  } finally {
    loading.value = false
  }
}

onMounted(loadCourseData)

const handleEnrollStudent = async () => {
  isSubmitting.value = true
  try {
    const response = await courseApi.enrollStudent(courseId, newStudentForm.value)

    $q.notify({
      color: 'positive',
      message: response.data.message,
      icon: 'check_circle'
    })

    // Limpiamos el formulario y recargamos la lista de estudiantes
    newStudentForm.value = { name: '', email: '' }
    await loadCourseData()
  } catch (error) {
    console.error('Error al matricular estudiante:', error)
    const errorMsg = error.response?.data?.message || 'Ocurrió un error.'
    $q.notify({ color: 'negative', message: errorMsg })
  } finally {
    isSubmitting.value = false
  }
}
</script>
