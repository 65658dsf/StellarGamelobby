import axios from 'axios'

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'https://api.stellarfrp.top',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          // 权限不足
          console.error('权限不足')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器错误')
          break
        default:
          console.error('其他错误')
      }
    }
    return Promise.reject(error.response?.data || error)
  }
)

// API 方法
export const api = {
  auth: {
    login: (credentials) => instance.post('/login', credentials),
    getUserInfo: () => instance.post('/GetUserInfo'),
    logout: () => instance.post('/logout')
  },
  
  rooms: {
    create: (roomData) => instance.post('/rooms/create', roomData),
    list: () => instance.get('/rooms/list'),
    join: (roomId) => instance.post(`/rooms/join/${roomId}`),
    delete: (roomId) => instance.delete(`/rooms/${roomId}`),
    verifyPassword: (data) => instance.post('/rooms/verify-password', data)
  }
}

export default api 