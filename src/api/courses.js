// src/api/courses.js
import { api } from 'boot/axios'

const ENDPOINT = '/courses' // Asumiremos que crearemos este endpoint en el backend

export const courseApi = {
  /**
   * Obtiene una lista de cursos, opcionalmente filtrada por docente.
   * @param {object} params - ej: { teacher_id: 1, perPage: -1 }
   */
  fetch: (params) => api.get(ENDPOINT, { params }),
  /**
   * NUEVO: Obtiene los detalles de un curso por su ID.
   */
  getById: (courseId) => api.get(`${ENDPOINT}/${courseId}`),

  /**
   * NUEVO: Matricula un estudiante en un curso.
   */
  enrollStudent: (courseId, data) => api.post(`${ENDPOINT}/${courseId}/students`, data)
}
