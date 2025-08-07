import { api } from 'boot/axios'
const ENDPOINT = '/users'
export const userApi = {
  //fetch: (params) => api.get(ENDPOINT, { params }),
  fetch: (params) => api.get('/users', { params }),
  create: (data) => api.post(ENDPOINT, data),
  update: (id, data) => api.put(`${ENDPOINT}/${id}`, data),
  destroy: (id) => api.delete(`${ENDPOINT}/${id}`)
}
