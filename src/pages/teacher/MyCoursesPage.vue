<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Mis Cursos Asignados</div>

    <div v-if="loading" class="flex flex-center q-mt-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <q-banner v-else-if="!loading && courses.length === 0" class="bg-blue-1 text-grey-8">
      <template v-slot:avatar>
        <q-icon name="info" color="info" />
      </template>
      Aún no tienes cursos asignados. Por favor, contacta a un administrador.
    </q-banner>

    <q-list v-else bordered separator>
      <q-item
        v-for="course in courses"
        :key="course.id"
        :to="`/admin/courses/${course.id}`"
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-icon color="primary" name="school" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-bold">{{ course.subject.name }} ({{ course.subject.acronym }})</q-item-label>
          <q-item-label caption>
            Semestre: {{ course.semester }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-icon name="arrow_forward_ios" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { courseApi } from 'src/api/courses'

const $q = useQuasar()
const authStore = useAuthStore()
const courses = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUser()
  }

  if (!authStore.user) {
    loading.value = false
    $q.notify({ color: 'negative', message: 'No se pudo verificar tu identidad.' })
    return
  }

  try {
    const response = await courseApi.fetch({ teacher_id: authStore.user.id })
    courses.value = response.data.data
  } catch (error) {
    console.error('Error al cargar los cursos:', error)
    $q.notify({ color: 'negative', message: 'No se pudieron cargar tus cursos.' })
  } finally {
    loading.value = false
  }
})
</script>
