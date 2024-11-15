<template>
  <n-config-provider :theme="currentTheme" :theme-overrides="themeOverrides">
    <div :class="isDark ? 'dark-theme' : 'light-theme'" class="app-container">
      <n-message-provider>
        <n-dialog-provider>
          <n-loading-bar-provider>
            <router-view v-if="!loading" />
            <div v-else class="loading-container">
              <n-spin size="large" />
            </div>
          </n-loading-bar-provider>
        </n-dialog-provider>
      </n-message-provider>
      
      <!-- 全局页脚 -->
      <div class="global-footer" :class="{ 'login-page': isLoginPage }">
        <n-space vertical size="small" justify="center" align="center">
          <n-text :depth="3">由 StellarFrp 团队运营</n-text>
          <n-text :depth="3">
            官方QQ群：
            <n-button text tag="a" 
              href="https://qm.qq.com/q/yVa7HqFkWI" 
              target="_blank"
              style="padding: 0; font-size: inherit;"
            >
              754990115
            </n-button>
          </n-text>
          <n-text :depth="3">运行时长：{{ uptime }}</n-text>
        </n-space>
      </div>
    </div>
  </n-config-provider>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NConfigProvider, 
  NMessageProvider, 
  NDialogProvider,
  NLoadingBarProvider, 
  NSpin,
  darkTheme,
  lightTheme,
  NSpace,
  NText,
  NButton
} from 'naive-ui'
import { useAuthStore } from './store/auth'

const loading = ref(true)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 计算是否在登录页
const isLoginPage = computed(() => route.path === '/login')

// 计算运行时间
const startTime = new Date('2024-11-13').getTime() // 设置开始运行的时间
const uptime = ref('')

// 更新运行时间的函数
const updateUptime = () => {
  const now = new Date().getTime()
  const diff = now - startTime
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  uptime.value = `${days}天${hours}小时${minutes}分钟${seconds}秒`
}

// 组件挂载时启动定时器
onMounted(() => {
  updateUptime() // 立即执行一次
  setInterval(updateUptime, 1000) // 每秒更新一次
})

// 主题相关
const isDark = ref(localStorage.getItem('theme') === 'dark')
const isGold = computed(() => authStore.user?.vipTime && new Date(authStore.user.vipTime) > new Date())

// 主题覆盖
const themeOverrides = computed(() => {
  if (!isGold.value) return {}
  
  // 会员主题配色
  return isDark.value ? {
    // 黑金主题
    common: {
      primaryColor: '#FFD700',
      primaryColorHover: '#FFE55C',
      primaryColorPressed: '#DAA520',
      primaryColorSuppl: '#B8860B',
      baseColor: '#000000',
      textColorBase: '#FFD700',
      textColor1: '#FFD700',
      textColor2: '#DAA520',
      textColor3: '#B8860B',
      borderColor: '#FFD700',
      cardColor: '#1a1a1a',
      modalColor: '#1a1a1a',
      bodyColor: '#000000',
      tagColor: '#2a2a2a',
      popoverColor: '#1a1a1a',
      dividerColor: '#333333',
      inputColor: '#1a1a1a',
      buttonColor2: '#1a1a1a',
      buttonColor2Hover: '#2a2a2a',
      buttonColor2Pressed: '#333333'
    },
    Card: {
      borderColor: '#FFD700',
      color: '#1a1a1a',
      titleTextColor: '#FFD700'
    },
    Button: {
      textColor: '#FFD700',
      borderColor: '#FFD700',
      borderColorHover: '#FFE55C',
      borderColorPressed: '#DAA520'
    },
    Input: {
      color: '#1a1a1a',
      borderColor: '#FFD700',
      borderColorHover: '#FFE55C',
      borderColorFocus: '#DAA520',
      textColor: '#FFD700',
      placeholderColor: '#B8860B'
    },
    Tag: {
      borderColor: '#FFD700'
    }
  } : {
    // 白金主题（改为更鲜明的配色）
    common: {
      primaryColor: '#4A90E2',           // 明亮的蓝色
      primaryColorHover: '#5C9EE6',
      primaryColorPressed: '#3A80D2',
      primaryColorSuppl: '#2970C2',
      baseColor: '#FFFFFF',
      textColorBase: '#333333',          // 深灰色文本
      textColor1: '#1A1A1A',             // 近黑色主文本
      textColor2: '#444444',             // 次要文本
      textColor3: '#666666',             // 辅助文本
      borderColor: '#4A90E2',            // 边框使用主色调
      cardColor: '#FFFFFF',
      modalColor: '#FFFFFF',
      bodyColor: '#F5F5F5',
      tagColor: '#F0F7FF',               // 淡蓝色标签背景
      popoverColor: '#FFFFFF',
      dividerColor: '#E8E8E8',
      inputColor: '#FFFFFF',
      buttonColor2: '#FFFFFF',
      buttonColor2Hover: '#F5F7FA',
      buttonColor2Pressed: '#E6EBF5'
    },
    Card: {
      borderColor: '#4A90E2',
      color: '#FFFFFF',
      titleTextColor: '#1A1A1A'
    },
    Button: {
      textColor: '#333333',
      borderColor: '#4A90E2',
      borderColorHover: '#5C9EE6',
      borderColorPressed: '#3A80D2'
    },
    Input: {
      color: '#FFFFFF',
      borderColor: '#4A90E2',
      borderColorHover: '#5C9EE6',
      borderColorFocus: '#3A80D2',
      textColor: '#333333',
      placeholderColor: '#999999'
    },
    Tag: {
      borderColor: '#4A90E2'
    }
  }
})

// 当前主题
const currentTheme = computed(() => isDark.value ? darkTheme : lightTheme)

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// 监听会员状态变化
watch(() => authStore.user?.vipTime, () => {
  // 会员状态改变时重新计算主题
}, { immediate: true })

// 暴露给全局
window.$toggleTheme = toggleTheme

onMounted(async () => {
  try {
    const isLoggedIn = await authStore.autoLogin()
    if (!isLoggedIn && router.currentRoute.value.meta.requiresAuth) {
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
})
</script>

<style>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

:root {
  --primary-color: #18a058;
}

/* 添加主题类 */
.light-theme {
  --background-color: #f5f5f5;
  background-color: var(--background-color);
  min-height: 100vh;
}

.dark-theme {
  --background-color: #121212;
  background-color: var(--background-color);
  min-height: 100vh;
}

/* 会员主题类 */
.light-theme.vip {
  --background-color: #f8f8f8;
}

.dark-theme.vip {
  --background-color: #000000;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; /* 根据页脚高度调整 */
}

.global-footer {
  text-align: center;
  padding: 12px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

/* 移除页脚的滚动条 */
.global-footer :deep(.n-space) {
  margin: 0 !important;
  padding: 0 !important;
}

/* 优化链接样式 */
.global-footer :deep(.n-button) {
  line-height: inherit;
  height: auto;
  margin: 0;
  color: inherit !important;
  text-decoration: underline;
}

.global-footer :deep(.n-button:hover) {
  color: var(--primary-color) !important;
}

/* 非登录页的页脚样式 */
.light-theme .global-footer:not(.login-page) {
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.dark-theme .global-footer:not(.login-page) {
  background: rgba(0, 0, 0, 0.85);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 登录页的页脚样式 */
.light-theme .global-footer.login-page {
  background: rgba(255, 255, 255, 0.1);
}

.dark-theme .global-footer.login-page {
  background: rgba(0, 0, 0, 0.2);
}

/* 页脚文本颜色 */
.light-theme .global-footer:not(.login-page) :deep(.n-text) {
  color: rgba(0, 0, 0, 0.7) !important;
}

.dark-theme .global-footer:not(.login-page) :deep(.n-text) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.global-footer.login-page :deep(.n-text) {
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 确保内容区域填充剩余空间 */
.n-loading-bar-provider {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style> 