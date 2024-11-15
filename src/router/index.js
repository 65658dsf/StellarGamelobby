import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../components/LoginForm.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/lobby',
      component: () => import('../components/GameLobby.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/login'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果页面需要认证且用户未登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 先检查 URL 中是否有 token 参数
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    
    if (token) {
      // 如果有 token，保存并尝试自动登录
      localStorage.setItem('token', token)
      try {
        const isAutoLoginSuccessful = await authStore.autoLogin()
        if (isAutoLoginSuccessful) {
          // 登录成功，清除 URL 中的 token 参数并跳转到目标页面
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, '', cleanUrl)
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
  
  // 如果用户已登录且试图访问登录页，重定向到大厅
  if (to.path === '/login' && authStore.isAuthenticated) {
    return next('/lobby')
  }
  
  next()
})

export default router 