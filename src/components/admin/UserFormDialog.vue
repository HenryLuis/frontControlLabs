<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card style="width: 500px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6">{{ isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</div>
      </q-card-section>

      <q-form @submit.prevent="onFormSubmit">
        <q-card-section class="q-gutter-md">
          <q-input v-model="formData.name" label="Nombre Completo" filled lazy-rules :rules="[val => !!val || 'El nombre es requerido']" />
          <q-input v-model="formData.email" label="Correo Electrónico" type="email" filled lazy-rules :rules="[val => !!val || 'El correo es requerido']" />
          <q-select
            filled
            v-model="formData.roles"
            :options="roleOptions"
            label="Roles"
            multiple use-chips stack-label
            lazy-rules :rules="[val => val && val.length > 0 || 'Debe seleccionar al menos un rol']"
          />
          <q-input
            v-model="formData.password"
            label="Contraseña"
            type="password"
            filled
            :hint="isEditMode ? 'Dejar en blanco para no cambiar' : ''"
            lazy-rules :rules="isEditMode ? [] : [val => !!val || 'La contraseña es requerida']"
          />
          <q-input
            v-model="formData.password_confirmation"
            label="Confirmar Contraseña"
            type="password"
            filled
            lazy-rules :rules="[val => val === formData.password || 'Las contraseñas no coinciden']"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn type="submit" :label="isEditMode ? 'Actualizar' : 'Crear'" color="primary" :loading="isSubmitting" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { roleApi } from 'src/api/roles'

const props = defineProps({
  modelValue: Boolean, // Para controlar la visibilidad con v-model
  user: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['update:modelValue', 'user-saved'])

const isEditMode = computed(() => !!props.user)
const formData = ref({})
const roleOptions = ref([])
const isSubmitting = ref(false)

// Cargar los roles disponibles cuando el componente se monta
onMounted(async () => {
  try {
    const response = await roleApi.fetch()
    roleOptions.value = response.data.map(role => role.name)
  } catch (error) {
    console.error('Error al cargar roles:', error)
  }
})

// Observar cambios en el prop 'user' para rellenar el formulario
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      roles: newUser.roles.map(role => role.name),
      password: '',
      password_confirmation: ''
    }
  } else {
    formData.value = { name: '', email: '', roles: [], password: '', password_confirmation: '' }
  }
})

const onFormSubmit = () => {
  emit('user-saved', formData.value)
}
</script>
