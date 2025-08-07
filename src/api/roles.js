import { api } from 'boot/axios'
const ENDPOINT = '/roles'
export const roleApi = {
  fetch: () => api.get(ENDPOINT)
}
