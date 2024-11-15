import { defineStore } from 'pinia'
import { api } from '../utils/api'
import md5 from 'crypto-js/md5'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null
  }),
  
  getters: {
    userAvatar: (state) => {
      if (!state.user?.email) return ''
      const emailMd5 = md5(state.user.email.toLowerCase()).toString()
      return `https://weavatar.com/avatar/${emailMd5}?s=40`
    }
  },
  
  actions: {
    async login(credentials) {
      try {
        const response = await api.auth.login(credentials)
        
        this.token = response.data.token
        this.user = {
          email: response.data.email,
          username: response.data.username,
          group: response.data.group,
          regTime: response.data.regTime,
          vipTime: this.isValidVipTime(response.data.vipTime) ? response.data.vipTime : null
        }
        this.isAuthenticated = true
        
        if (credentials.rememberMe) {
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      } catch (error) {
        throw new Error(error.message || '登录失败')
      }
    },

    isValidVipTime(vipTime) {
      if (!vipTime) return false
      return new Date(vipTime) > new Date()
    },

    async autoLogin() {
      const token = localStorage.getItem('token')
      
      if (!token) return false

      try {
        const response = await api.auth.getUserInfo(token)
        
        this.token = token
        this.user = {
          email: response.data.email,
          username: response.data.username,
          group: response.data.group,
          regTime: response.data.regTime,
          vipTime: this.isValidVipTime(response.data.vipTime) ? response.data.vipTime : null
        }
        this.isAuthenticated = true
        return true
      } catch (error) {
        this.clearAuth()
        return false
      }
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    logout() {
      this.clearAuth()
    }
  }
}) 