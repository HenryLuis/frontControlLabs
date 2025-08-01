// src/api/classrooms.js

import { api } from 'boot/axios' // Importas tu instancia de Axios configurada

const ENDPOINT = '/classrooms'

export const classroomApi = {
  /**
   * Obtiene una lista paginada de aulas con filtros.
   * @param {object} params - Parámetros de paginación, búsqueda y ordenación.
   */
  fetch: (params) => api.get(ENDPOINT, { params }),

  /**
   * Obtiene un aula por su ID.
   * @param {number} id
   */
  getById: (id) => api.get(`${ENDPOINT}/${id}`),

  /**
   * Crea una nueva aula.
   * @param {object} data - Datos del aula { name, description, capacity }.
   */
  create: (data) => api.post(ENDPOINT, data),

  /**
   * Actualiza un aula existente.
   * @param {number} id
   * @param {object} data - Datos del aula a actualizar.
   */
  update: (id, data) => api.put(`${ENDPOINT}/${id}`, data),

  /**
   * Elimina un aula.
   * @param {number} id
   */
  destroy: (id) => api.delete(`${ENDPOINT}/${id}`)
}
