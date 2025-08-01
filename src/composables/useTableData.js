import { ref, onMounted, watch  } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Composable para gestionar la lógica de una tabla de datos de Quasar
 * con paginación, ordenación y filtrado del lado del servidor.
 * @param {Function} fetchApi - La función de la API que obtiene los datos.
 */
export default function useTableData (fetchApi, filterRef = ref('')) {
  const $q = useQuasar()

  const rows = ref([])
  const loading = ref(false)
  const pagination = ref({
    sortBy: 'id', // Campo de ordenación inicial
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0 // Número total de filas en el servidor
  })

  const fetchData = async () => {
    loading.value = true
    try {
      // Construimos los parámetros para enviar a la API
      const params = {
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        sortDirection: pagination.value.descending ? 'desc' : 'asc',
        search: filterRef.value
      }

      const response = await fetchApi(params)

      // Actualizamos los datos de la tabla y la paginación
      rows.value = response.data.data
      pagination.value.rowsNumber = response.data.meta.total
    } catch (error) {
      console.error('Error al obtener los datos de la tabla:', error)
      $q.notify({
        color: 'negative',
        message: 'No se pudieron cargar los datos.'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Esta función es llamada por la QTable cada vez que el usuario
   * cambia de página, ordena una columna, etc.
   * @param {object} props - Propiedades del evento, incluyendo la paginación.
   */
  const onRequest = (props) => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
    fetchData()
  }

  watch(filterRef, () => {
    pagination.value.page = 1
    fetchData()
  })
  // Carga los datos iniciales cuando el componente se monta
  onMounted(() => {
    fetchData()
  })

  return {
    rows,
    loading,
    pagination,
    onRequest,
    fetchData // Devolvemos fetchData para poder refrescar la tabla manualmente
  }
}
