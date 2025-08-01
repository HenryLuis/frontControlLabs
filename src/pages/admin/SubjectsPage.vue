<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Gestión de Materias</div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      @request="onRequest"
      binary-state-sort
    >
      <template v-slot:top-right>
        <q-btn color="primary" icon="add" label="Nueva Materia" @click="handleNewItem" />
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense round flat icon="edit" @click="handleEditItem(props.row)"></q-btn>
          <q-btn dense round flat icon="delete" color="negative" @click="handleDeleteItem(props.row)"></q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogVisible">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">{{ isEditMode ? 'Editar Materia' : 'Nueva Materia' }}</div>
        </q-card-section>

        <q-form @submit="onFormSubmit">
          <q-card-section>
            <q-input
              v-model="formData.name"
              label="Nombre de la Materia"
              filled
              lazy-rules
              :rules="[val => !!val || 'El nombre es requerido']"
            />
            <q-input
              v-model="formData.acronym"
              label="Sigla"
              filled
              class="q-mt-md"
              lazy-rules
              :rules="[val => !!val || 'La sigla es requerida']"
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
import useTableData from 'src/composables/useTableData'
import { subjectApi } from 'src/api/subjects' // <-- Usamos el nuevo servicio

const $q = useQuasar()

// --- Lógica de la Tabla ---
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'name', label: 'Nombre', field: 'name', sortable: true, align: 'left' },
  { name: 'acronym', label: 'Sigla', field: 'acronym', sortable: true, align: 'left' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
]

const {
  rows,
  loading,
  pagination,
  onRequest,
  fetchData
} = useTableData(subjectApi.fetch) // <-- Pasamos la nueva función de API

// --- Lógica del Diálogo y Formulario ---
const dialogVisible = ref(false)
const isEditMode = ref(false)
const formData = ref({})

const handleNewItem = () => {
  formData.value = { name: '', acronym: '' }
  isEditMode.value = false
  dialogVisible.value = true
}

const handleEditItem = (item) => {
  formData.value = { ...item }
  isEditMode.value = true
  dialogVisible.value = true
}

const onFormSubmit = async () => {
  try {
    if (isEditMode.value) {
      await subjectApi.update(formData.value.id, formData.value)
    } else {
      await subjectApi.create(formData.value)
    }
    $q.notify({
      color: 'positive',
      message: `Materia ${isEditMode.value ? 'actualizada' : 'creada'} con éxito.`
    })
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Error al guardar la materia:', error)
    $q.notify({
      color: 'negative',
      message: 'Ocurrió un error al guardar la materia.'
    })
  }
}

const handleDeleteItem = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Estás seguro de que deseas eliminar la materia "${item.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await subjectApi.destroy(item.id)
      $q.notify({
        color: 'positive',
        message: 'Materia eliminada con éxito.'
      })
      fetchData()
    } catch (error) {
      console.error('Error al eliminar la materia:', error)
      $q.notify({
        color: 'negative',
        message: 'Ocurrió un error al eliminar la materia.'
      })
    }
  })
}
</script>
