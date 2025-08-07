<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Gestión de Usuarios</div>

    <q-table :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading" @request="onRequest" flat bordered>
      <template v-slot:top-right>
        <q-btn color="primary" icon="add" label="Nuevo Usuario" @click="handleNewUser" />
      </template>
      <template v-slot:body-cell-roles="props">
        <q-td :props="props">
          <q-chip v-for="role in props.row.roles" :key="role.name" :label="role.name" size="sm" />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense round flat icon="edit" @click="handleEditUser(props.row)"></q-btn>
          <q-btn dense round flat icon="delete" color="negative" @click="handleDeleteUser(props.row)"></q-btn>
        </q-td>
      </template>
    </q-table>

    <UserFormDialog v-model="dialogVisible" :user="userToEdit" @user-saved="onUserSaved" />

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import useTableData from 'src/composables/useTableData'
import { userApi } from 'src/api/users'
import UserFormDialog from 'src/components/admin/UserFormDialog.vue'

const $q = useQuasar()

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'email', label: 'Correo', field: 'email', align: 'left', sortable: true },
  { name: 'roles', label: 'Roles', field: 'roles', align: 'left' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
]

const { rows, loading, pagination, onRequest, fetchData } = useTableData(userApi.fetch)

const dialogVisible = ref(false)
const userToEdit = ref(null)

const handleNewUser = () => {
  userToEdit.value = null
  dialogVisible.value = true
}
const handleEditUser = (user) => {
  userToEdit.value = user
  dialogVisible.value = true
}

const onUserSaved = async (formData) => {
  try {
    if (formData.id) {
      await userApi.update(formData.id, formData)
    } else {
      await userApi.create(formData)
    }
    $q.notify({ color: 'positive', message: 'Usuario guardado con éxito.' })
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Error al guardar usuario:', error)
    $q.notify({ color: 'negative', message: 'Ocurrió un error al guardar el usuario.' })
  }
}

const handleDeleteUser = (user) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Estás seguro de que deseas eliminar al usuario "${user.name}"?`,
    cancel: true
  }).onOk(async () => {
    try {
      await userApi.destroy(user.id)
      $q.notify({ color: 'positive', message: 'Usuario eliminado.' })
      fetchData()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      $q.notify({ color: 'negative', message: 'Error al eliminar usuario.' })
    }
  })
}
</script>
