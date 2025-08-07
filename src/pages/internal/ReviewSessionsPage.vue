<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Revisión de Sesiones de Laboratorio</div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      @request="onRequest"
      class="q-mt-md"
      flat
      bordered
    >
      <!-- Slot para la columna de "Estado de Revisión" para hacerla más visual -->
      <template v-slot:body-cell-reviewed_at="props">
        <q-td :props="props">
          <q-chip
            v-if="props.row.reviewed_at"
            color="positive"
            text-color="white"
            icon="check"
            size="sm"
            label="Revisado"
          />
          <q-chip
            v-else
            color="warning"
            text-color="white"
            icon="hourglass_empty"
            size="sm"
            label="Pendiente"
          />
        </q-td>
      </template>

      <!-- Slot para la columna de Acciones -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="rate_review"
            :to="`/admin/lab-sessions/${props.row.id}`"
            color="primary"
          >
            <q-tooltip>Ver / Revisar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
//import { ref } from 'vue'
import { date } from 'quasar'
import useTableData from 'src/composables/useTableData'
import { labSessionApi } from 'src/api/labSessions'

const columns = [
  { name: 'subject', label: 'Materia', field: row => row.course.subject.name, align: 'left', sortable: true },
  { name: 'teacher', label: 'Docente', field: row => row.course.teacher.name, align: 'left', sortable: true },
  { name: 'session_date', label: 'Fecha', field: 'session_date', align: 'left', sortable: true },
  { name: 'reviewed_at', label: 'Revisión', field: 'reviewed_at', align: 'center', format: val => val ? date.formatDate(val, 'DD/MM/YYYY') : 'Pendiente' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
]

// Función de fetch que siempre filtra por sesiones cerradas
const fetchFunction = (requestParams) => {
  const params = {
    ...requestParams,
    status: 'closed'
  }
  return labSessionApi.fetch(params)
}

const { rows, loading, pagination, onRequest } = useTableData(fetchFunction)
</script>
