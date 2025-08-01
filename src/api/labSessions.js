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
  fetch: (params) => api.get(ENDPOINT, { params }),

  /**
   * NUEVO: Un estudiante registra su asistencia en una sesión.
   * @param {number} sessionId - El ID de la sesión.
   * @param {object} data - Datos de la asistencia { pc_number, student_signature }.
   */
  addAttendance: (sessionId, data) => api.post(`${ENDPOINT}/${sessionId}/attend`, data)
}
