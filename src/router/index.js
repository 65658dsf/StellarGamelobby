import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/lobby',
      component: () => import('../components/GameLobby.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/lobby'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果用户未登录
  if (!authStore.isAuthenticated) {
    // 获取 URL 中的 token 参数
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    
    if (token) {
      // 如果有 token，保存并尝试自动登录
      localStorage.setItem('token', token)
      try {
        const isAutoLoginSuccessful = await authStore.autoLogin()
        if (isAutoLoginSuccessful) {
          // 登录成功，清除 URL 中的 token 参数并跳转到主页
          window.history.replaceState({}, '', '/lobby')
          return next()
        }
      } catch (error) {
        console.error('Auto login failed:', error)
      }
    }
    
    // 如果没有 token 或登录失败，重定向到认证页面
    window.location.href = 'https://auth.stellarfrp.top/?return=' + encodeURIComponent(window.location.href)
    return
  }
  
  next()
})

export default router 