<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Mis Sesiones de Laboratorio</div>

    <q-tabs v-model="filterStatus" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
      <q-tab name="open" label="Abiertas" />
      <q-tab name="closed" label="Historial (Cerradas)" />
    </q-tabs>
    <q-separator />

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      @request="onRequest"
      class="q-mt-md"
      flat bordered
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn flat round dense icon="visibility" :to="`/admin/lab-sessions/${props.row.id}`" color="grey-8"><q-tooltip>Ver Detalles</q-tooltip></q-btn>
          <q-btn flat round dense icon="print" @click="handlePrint(props.row)" color="blue-grey-7"><q-tooltip>Imprimir Reporte</q-tooltip></q-btn>
          <q-btn v-if="props.row.status === 'open'" flat round dense icon="edit" @click="openEditDialog(props.row)" color="primary"><q-tooltip>Editar Sesión</q-tooltip></q-btn>
          <q-btn v-if="props.row.status === 'closed'" flat round dense icon="lock_open" @click="handleReopen(props.row)" color="positive"><q-tooltip>Reabrir Sesión</q-tooltip></q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo de Edición -->
    <q-dialog v-model="editDialogVisible">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Editar Sesión de Laboratorio</div>
        </q-card-section>
        <q-form @submit.prevent="handleUpdateSession">
          <q-card-section class="q-gutter-md">
            <q-input :model-value="sessionToEdit.course?.subject?.name" label="Curso" filled readonly />
            <q-select
              filled
              v-model="sessionToEdit.classroom_id"
              :options="classroomOptions"
              label="Cambiar Aula"
              emit-value map-options lazy-rules
              :rules="[val => !!val || 'Debe seleccionar un aula']"
              :loading="loadingClassrooms"
            />
            <q-input filled v-model="sessionToEdit.session_date" label="Fecha de la Sesión" mask="YYYY-MM-DD" :rules="[val => !!val || 'Fecha requerida']">
              <template v-slot:append><q-icon name="event" class="cursor-pointer"><q-popup-proxy><q-date v-model="sessionToEdit.session_date" mask="YYYY-MM-DD" /></q-popup-proxy></q-icon></template>
            </q-input>
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input filled v-model="sessionToEdit.start_time" label="Hora de Inicio" mask="time" :rules="['time']">
                  <template v-slot:append><q-icon name="access_time" class="cursor-pointer"><q-popup-proxy><q-time v-model="sessionToEdit.start_time" /></q-popup-proxy></q-icon></template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input filled v-model="sessionToEdit.end_time" label="Hora de Fin" mask="time" :rules="['time']">
                  <template v-slot:append><q-icon name="access_time" class="cursor-pointer"><q-popup-proxy><q-time v-model="sessionToEdit.end_time" /></q-popup-proxy></q-icon></template>
                </q-input>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn type="submit" label="Guardar Cambios" color="primary" :loading="isUpdating" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { labSessionApi } from 'src/api/labSessions'
import { classroomApi } from 'src/api/classrooms'
import useTableData from 'src/composables/useTableData'

const $q = useQuasar()
const authStore = useAuthStore()

// --- Lógica de la Tabla y Filtros ---
const filterStatus = ref('open')
const columns = [
  { name: 'subject', label: 'Materia', field: row => row.course.subject.name, align: 'left', sortable: true },
  { name: 'classroom', label: 'Aula', field: row => row.classroom.name, align: 'left' },
  { name: 'session_date', label: 'Fecha', field: 'session_date', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
]
const fetchFunction = (requestParams) => {
  const params = { ...requestParams, status: filterStatus.value, teacher_id: authStore.user?.id }
  return labSessionApi.fetch(params)
}
const { rows, loading, pagination, onRequest, fetchData } = useTableData(fetchFunction)
watch(filterStatus, () => fetchData())

// --- Lógica del Diálogo de Edición ---
const editDialogVisible = ref(false)
const isUpdating = ref(false)
const sessionToEdit = ref({})
const classroomOptions = ref([])
const loadingClassrooms = ref(false)

const loadClassrooms = async () => {
  loadingClassrooms.value = true
  try {
    const res = await classroomApi.fetch({ perPage: -1 })
    classroomOptions.value = res.data.data.map(c => ({ label: c.name, value: c.id }))
  } catch (error) {
    console.error('Error al cargar las aulas:', error);
    $q.notify({ color: 'negative', message: 'No se pudieron cargar las aulas.' })
  } finally {
    loadingClassrooms.value = false
  }
}

const openEditDialog = (session) => {
  // Hacemos una copia profunda para no modificar la tabla directamente
  sessionToEdit.value = JSON.parse(JSON.stringify(session))
  editDialogVisible.value = true
}

const handleUpdateSession = async () => {
  isUpdating.value = true
  try {
    // Solo enviamos los campos que se pueden editar
    const dataToUpdate = {
      classroom_id: sessionToEdit.value.classroom_id,
      session_date: sessionToEdit.value.session_date,
      start_time: sessionToEdit.value.start_time,
      end_time: sessionToEdit.value.end_time,
    }
    await labSessionApi.update(sessionToEdit.value.id, dataToUpdate)
    $q.notify({ color: 'positive', message: 'Sesión actualizada con éxito.' })
    editDialogVisible.value = false
    fetchData() // Recargamos la tabla para ver los cambios
  } catch (error) {
    console.error('Error al actualizar la sesión:', error)
    $q.notify({ color: 'negative', message: 'No se pudo actualizar la sesión.' })
  } finally {
    isUpdating.value = false
  }
}

// Cargar las aulas una vez cuando el componente se monta
onMounted(loadClassrooms)

// --- Lógica de Acciones (Imprimir, Reabrir) ---
const handlePrint = async (session) => {
$q.loading.show({ message: 'Generando PDF...' })
  try {
    const response = await labSessionApi.downloadPdf(session.id)
    // Lógica para descargar el archivo blob
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte-sesion-${session.id}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error al descargar el PDF:', error)
    $q.notify({ color: 'negative', message: 'No se pudo generar el PDF.' })
  } finally {
    $q.loading.hide()
  }
}
const handleReopen = (session) => {
$q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de que deseas reabrir esta sesión? Los estudiantes podrán volver a registrar su asistencia.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    $q.loading.show({ message: 'Reabriendo sesión...' })
    try {
      await labSessionApi.reopen(session.id)
      $q.notify({ color: 'positive', message: 'Sesión reabierta con éxito.' })
      fetchData() // Recargamos la tabla para que la sesión cambie de tab
    } catch (error) {
      console.error('Error al reabrir la sesión:', error)
      $q.notify({ color: 'negative', message: 'No se pudo reabrir la sesión.' })
    } finally {
      $q.loading.hide()
    }
  })
}
</script>
