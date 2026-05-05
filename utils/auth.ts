import api from '@/api/api'

export const authUtils = {
  setAuth: (
    tokens: { access_token: string; refresh_token: string },
    userData: Record<string, any> = {},
    rememberMe: boolean = false
  ) => {
    if (typeof window === 'undefined') return
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('accessToken', tokens.access_token)
    storage.setItem('refreshToken', tokens.refresh_token)
    storage.setItem('userData', JSON.stringify(userData))
  },

  getAuth: () => {
    if (typeof window === 'undefined') {
      return { token: null, userData: null }
    }

    const token = localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken')

    const userDataRaw = localStorage.getItem('userData') ?? sessionStorage.getItem('userData')

    const userData = userDataRaw ? JSON.parse(userDataRaw) : null

    return { token, userData }
  },

  clearAuth: async () => {
    if (typeof window === 'undefined') return

    if (localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')) {
      try {
        await api.post('/users/auth/logout')
      } catch (error) {
        console.error('Error during logout:', error)
      }
    }
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userData')

    sessionStorage.removeItem('refreshToken')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('userData')
  }
}
