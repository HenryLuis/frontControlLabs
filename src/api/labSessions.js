// src/api/labSessions.js
import { api } from 'boot/axios'

const ENDPOINT = '/lab-sessions'

export const labSessionApi = {
  /**
   * Crea la cabecera de una nueva sesión de laboratorio.
   * @param {object} data - Datos de la cabecera { classroom_id, subject_id, etc. }
   */
  createHeader: (data) => api.post(ENDPOINT, data),

  /**
   * NUEVO: Obtiene una lista de sesiones filtradas (ej. por status).
   * @param {object} params - Parámetros de filtro, como { status: 'open' }.
   */
  /* fetch: (params) => {
    // Si se pide explícitamente las sesiones abiertas, usa la nueva ruta
    if (params?.status === 'open' && !params?.teacher_id) {
      return api.get(`${ENDPOINT}/open`, { params })
    }
    // Para cualquier otro caso (ej. el admin viendo todas), usa la ruta base
    return api.get(ENDPOINT, { params })
  }, */

  fetch: (params) => api.get(ENDPOINT, { params }),

  /**
   * NUEVO: Un estudiante registra su asistencia en una sesión.
   * @param {number} sessionId - El ID de la sesión.
   * @param {object} data - Datos de la asistencia { pc_number, student_signature }.
   */
  addAttendance: (sessionId, data) => api.post(`${ENDPOINT}/${sessionId}/attend`, data),
  addObservation: (sessionId, data) => api.post(`${ENDPOINT}/${sessionId}/observations`, data),
  /**
   * NUEVO: Obtiene los detalles completos de una sesión por su ID.
   */
  getById: (sessionId) => api.get(`${ENDPOINT}/${sessionId}`),

  /**
   * NUEVO: Cierra una sesión de laboratorio.
   */
  close: (sessionId) => api.post(`${ENDPOINT}/${sessionId}/close`),
  /**
   * NUEVO: Reabre una sesión.
   */
  reopen: (sessionId) => api.post(`${ENDPOINT}/${sessionId}/reopen`),

  update: (sessionId, data) => api.put(`${ENDPOINT}/${sessionId}`, data),
  /**
   * NUEVO: Marca una sesión como revisada.
   */
  review: (sessionId) => api.post(`${ENDPOINT}/${sessionId}/review`),
  /**
   * NUEVO: Descarga el reporte PDF.
   * 'responseType: blob' es crucial para manejar archivos.
   */
  downloadPdf: (sessionId) => api.get(`${ENDPOINT}/${sessionId}/pdf`, { responseType: 'blob' })
}
