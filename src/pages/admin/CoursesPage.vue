<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Gestión de Cursos</div>
    <q-table :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading" @request="onRequest" flat bordered>
      <template v-slot:top-right>
        <q-btn color="primary" icon="add" label="Nuevo Curso" @click="openDialog()" />
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense round flat icon="edit" @click="openDialog(props.row)"></q-btn>
          <!-- TODO: Añadir botón de eliminar -->
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ isEditMode ? 'Editar Curso' : 'Nuevo Curso' }}</div>
        </q-card-section>
        <q-form @submit.prevent="onFormSubmit">
          <q-card-section class="q-gutter-md">
            <q-select filled v-model="formData.subject_id" :options="subjectOptions" label="Materia" emit-value map-options :rules="[val => !!val || 'Requerido']" />
            <q-select filled v-model="formData.teacher_id" :options="teacherOptions" label="Docente" emit-value map-options :rules="[val => !!val || 'Requerido']" />
            <q-input v-model="formData.semester" label="Semestre (ej: 1-2025)" filled :rules="[val => !!val || 'Requerido']" />
            <q-input v-model="formData.description" label="Descripción (ej: Grupo A)" filled />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn type="submit" :label="isEditMode ? 'Actualizar' : 'Crear'" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useTableData from 'src/composables/useTableData'
import { courseApi } from 'src/api/courses'
import { subjectApi } from 'src/api/subjects'
import { userApi } from 'src/api/users'

const columns = [
  { name: 'subject', label: 'Materia', field: row => row.subject.name, align: 'left' },
  { name: 'teacher', label: 'Docente', field: row => row.teacher.name, align: 'left' },
  { name: 'semester', label: 'Semestre', field: 'semester', align: 'left' },
  { name: 'actions', label: 'Acciones', align: 'right' }
]
const { rows, loading, pagination, onRequest, fetchData } = useTableData(courseApi.fetch)

const dialogVisible = ref(false)
const isEditMode = ref(false)
const formData = ref({})
const subjectOptions = ref([])
const teacherOptions = ref([])

const loadOptions = async () => {
  const [subjectsRes, teachersRes] = await Promise.all([
    subjectApi.fetch({ perPage: -1 }),
    userApi.fetch({ role: 'Docente', perPage: -1 })
  ])
  subjectOptions.value = subjectsRes.data.data.map(s => ({ label: `${s.name} (${s.acronym})`, value: s.id }))
  teacherOptions.value = teachersRes.data.data.map(t => ({ label: t.name, value: t.id }))
}
onMounted(loadOptions)

const openDialog = (course = null) => {
  if (course) {
    isEditMode.value = true
    formData.value = {
      id: course.id,
      subject_id: course.subject.id,
      teacher_id: course.teacher.id,
      semester: course.semester,
      description: course.description
    }
  } else {
    isEditMode.value = false
    formData.value = { subject_id: null, teacher_id: null, semester: '', description: '' }
  }
  dialogVisible.value = true
}

const onFormSubmit = async () => {
  try {
    if (isEditMode.value) {
      await courseApi.update(formData.value.id, formData.value)
    } else {
      await courseApi.create(formData.value)
    }
    dialogVisible.value = false
    fetchData() // Recargar la tabla
  } catch (error) {
    console.error('Error al guardar el curso', error)
  }
}
</script>
