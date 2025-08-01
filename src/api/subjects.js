// src/api/subjects.js
import { api } from 'boot/axios'

const ENDPOINT = '/subjects'

export const subjectApi = {
  fetch: (params) => api.get(ENDPOINT, { params }),
  create: (data) => api.post(ENDPOINT, data),
  update: (id, data) => api.put(`${ENDPOINT}/${id}`, data),
  destroy: (id) => api.delete(`${ENDPOINT}/${id}`)
}
