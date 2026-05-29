import axios from 'axios'
import { useLoginStore } from '../store/login.Store'
import { router } from '../router'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 401時に自動ログアウト
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const store = useLoginStore()
      store.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
