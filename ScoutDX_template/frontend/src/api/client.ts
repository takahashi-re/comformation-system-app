import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Cookie を含める
})

// ✅ 401 エラー時に自動ログアウト
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      import('../store/login.Store').then(({ useLoginStore }) => {
        const store = useLoginStore()
        store.logout()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      })
    }
    return Promise.reject(error)
  }
)
