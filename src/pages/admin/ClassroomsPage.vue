<template>
  <q-page padding>
    <!-- Título de la página -->
    <div class="text-h4 q-mb-md">Gestión de Aulas</div>

    <!-- Tabla de datos que usa las propiedades de useTableData -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      @request="onRequest"
      binary-state-sort
    >
      <!-- Botón para crear una nueva aula -->
      <template v-slot:top-right>
        <q-btn color="primary" icon="add" label="Nueva Aula" @click="handleNewClassroom" />
      </template>

      <!-- Columna de acciones (editar y eliminar) -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense round flat icon="edit" @click="handleEditClassroom(props.row)"></q-btn>
          <q-btn dense round flat icon="delete" color="negative" @click="handleDeleteClassroom(props.row)"></q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo para crear o editar un aula -->
    <q-dialog v-model="dialogVisible">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">{{ isEditMode ? 'Editar Aula' : 'Nueva Aula' }}</div>
        </q-card-section>

        <q-form @submit="onFormSubmit">
          <q-card-section>
            <q-input
              v-model="formData.name"
              label="Nombre del Aula"
              filled
              lazy-rules
              :rules="[val => !!val || 'El nombre es requerido']"
            />
            <q-input
              v-model="formData.description"
              label="Descripción (Opcional)"
              type="textarea"
              filled
              class="q-mt-md"
            />
            <q-input
              v-model.number="formData.capacity"
              label="Capacidad (Opcional)"
              type="number"
              filled
              class="q-mt-md"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn type="submit" label="Guardar" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import useTableData from 'src/composables/useTableData' // Tu composable mágico
import { classroomApi } from 'src/api/classrooms' // Nuestro nuevo servicio de API

const $q = useQuasar()

// --- Lógica de la Tabla (gracias a tu composable) ---
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'name', label: 'Nombre', field: 'name', sortable: true, align: 'left' },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
  { name: 'capacity', label: 'Capacidad', field: 'capacity', sortable: true, align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
]

// Usamos el composable, pasándole la función que obtiene los datos
const {
  rows,
  loading,
  pagination,
  onRequest,
  fetchData // Exponemos fetchData para poder refrescar la tabla
} = useTableData(classroomApi.fetch)

// --- Lógica del Diálogo y Formulario ---
const dialogVisible = ref(false)
const isEditMode = ref(false)
const formData = ref({})

// Abrir diálogo para una nueva aula
const handleNewClassroom = () => {
  formData.value = { name: '', description: '', capacity: null }
  isEditMode.value = false
  dialogVisible.value = true
}

// Abrir diálogo para editar un aula existente
const handleEditClassroom = (classroom) => {
  formData.value = { ...classroom } // Copiamos los datos para no modificar la tabla directamente
  isEditMode.value = true
  dialogVisible.value = true
}

// Enviar el formulario (crear o actualizar)
const onFormSubmit = async () => {
  try {
    if (isEditMode.value) {
      await classroomApi.update(formData.value.id, formData.value)
    } else {
      await classroomApi.create(formData.value)
    }
    $q.notify({
      color: 'positive',
      message: `Aula ${isEditMode.value ? 'actualizada' : 'creada'} con éxito.`
    })
    dialogVisible.value = false
    fetchData() // Refrescar los datos de la tabla
  } catch (error) {
    console.error('Error al guardar el aula:', error)
    $q.notify({
      color: 'negative',
      message: 'Ocurrió un error al guardar el aula.'
    })
  }
}

// Eliminar un aula
const handleDeleteClassroom = (classroom) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Estás seguro de que deseas eliminar el aula "${classroom.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await classroomApi.destroy(classroom.id)
      $q.notify({
        color: 'positive',
        message: 'Aula eliminada con éxito.'
      })
      fetchData() // Refrescar la tabla
    } catch (error) {
      console.error('Error al eliminar el aula:', error)
      $q.notify({
        color: 'negative',
        message: 'Ocurrió un error al eliminar el aula.'
      })
    }
  })
}
</script>
