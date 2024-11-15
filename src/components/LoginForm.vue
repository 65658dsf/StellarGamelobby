<template>
  <div class="login-container" :class="isDark ? 'dark-theme' : 'light-theme'" :style="backgroundStyle">
    <div class="login-overlay">
      <div class="login-content">
        <n-card class="login-card" :bordered="false">
          <template #header>
            <div class="login-header">
              <n-icon size="32" class="login-icon">
                <game-controller />
              </n-icon>
              <n-h2>Stellar-联机大厅</n-h2>
            </div>
          </template>
          
          <n-form
            ref="formRef"
            :model="formValue"
            :rules="rules"
            size="large"
          >
            <n-form-item label="登录方式">
              <n-radio-group v-model:value="loginType" size="large">
                <n-space>
                  <n-radio-button value="username">
                    <template #icon>
                      <n-icon><person /></n-icon>
                    </template>
                    用户名
                  </n-radio-button>
                  <n-radio-button value="email">
                    <template #icon>
                      <n-icon><mail /></n-icon>
                    </template>
                    邮箱
                  </n-radio-button>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item path="account">
              <n-input
                v-model:value="formValue.account"
                :placeholder="loginType === 'email' ? '请输入邮箱' : '请输入用户名'"
                round
              >
                <template #prefix>
                  <n-icon>
                    <template v-if="loginType === 'email'">
                      <mail />
                    </template>
                    <template v-else>
                      <person />
                    </template>
                  </n-icon>
                </template>
              </n-input>
            </n-form-item>

            <n-form-item path="password">
              <n-input
                v-model:value="formValue.password"
                type="password"
                show-password-on="click"
                placeholder="请输入密码"
                round
              >
                <template #prefix>
                  <n-icon><lock-closed /></n-icon>
                </template>
              </n-input>
            </n-form-item>

            <n-space justify="space-between" align="center">
              <n-checkbox v-model:checked="rememberMe">
                记住我
              </n-checkbox>
              <n-button quaternary size="small" @click="toggleTheme">
                <template #icon>
                  <n-icon>
                    <template v-if="isDark">
                      <sunny />
                    </template>
                    <template v-else>
                      <moon />
                    </template>
                  </n-icon>
                </template>
                {{ isDark ? '浅色' : '深色' }}主题
              </n-button>
            </n-space>

            <n-space vertical :size="24" style="width: 100%">
              <n-button
                type="primary"
                block
                secondary
                strong
                round
                :loading="loading"
                @click="handleLogin"
                class="login-button"
              >
                登录
              </n-button>

              <n-button
                block
                round
                @click="handleRegister"
              >
                注册账号
              </n-button>
            </n-space>
          </n-form>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '../store/auth'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NRadioGroup,
  NRadioButton,
  NCheckbox,
  NIcon,
  NH2,
  NSpace,
  NText
} from 'naive-ui'
import {
  GameController,
  Person,
  Mail,
  LockClosed,
  Moon,
  Sunny
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const authStore = useAuthStore()

const formRef = ref(null)
const loginType = ref('username')
const rememberMe = ref(false)
const loading = ref(false)
const backgroundUrl = ref('')

// 主题相关
const isDark = ref(localStorage.getItem('theme') === 'dark')
const toggleTheme = () => {
  window.$toggleTheme?.()
  isDark.value = !isDark.value
}

const formValue = ref({
  account: '',
  password: ''
})

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${backgroundUrl.value})`,
}))

const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    const credentials = {
      password: formValue.value.password,
      [loginType.value]: formValue.value.account,
      rememberMe: rememberMe.value
    }
    
    await authStore.login(credentials)
    message.success('登录成功')
    
    const redirectPath = route.query.redirect || '/lobby'
    router.replace(redirectPath)
  } catch (error) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 处理注册按钮点击
const handleRegister = () => {
  window.open('https://console.stellarfrp.top', '_blank')
}

onMounted(async () => {
  try {
    const response = await fetch('https://www.loliapi.com/acg/')
    if (response.ok) {
      backgroundUrl.value = response.url
    }
  } catch (error) {
    console.error('Failed to fetch background image:', error)
    // 设置一个默认背景色作为后备方案
    document.querySelector('.login-container').style.backgroundColor = '#f0f2f5'
  }
})

// 计算运行时间
const startTime = new Date('2024-01-01').getTime() // 设置开始运行的时间
const uptime = computed(() => {
  const now = new Date().getTime()
  const diff = now - startTime
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${days}天${hours}小时${minutes}分钟`
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.3s ease;
}

.login-overlay {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  padding: 20px 0;
  overflow-y: auto;
}

.login-card {
  width: 380px;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.light-theme .login-card {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
}

.light-theme .login-card :deep(.n-input) {
  background-color: rgba(255, 255, 255, 0.8);
}

.light-theme .login-icon {
  color: #18a058;
}

.dark-theme .login-card {
  background: rgba(24, 24, 28, 0.9) !important;
  backdrop-filter: blur(20px);
}

.dark-theme .login-card :deep(.n-input) {
  background-color: rgba(255, 255, 255, 0.09);
}

.dark-theme .login-icon {
  color: #63e2b7;
}

.dark-theme .login-card :deep(.n-button:not(.n-button--primary-type)) {
  color: rgba(255, 255, 255, 0.82);
}

:deep(.n-input .n-input__input-el),
:deep(.n-button) {
  border-radius: 24px !important;
}

:deep(.n-form-item) {
  margin-bottom: 12px;
}

:deep(.n-space) {
  width: 100%;
}

.theme-toggle {
  padding: 4px 12px;
  border-radius: 12px;
}

.light-theme .theme-toggle {
  background: rgba(0, 0, 0, 0.05);
}

.dark-theme .theme-toggle {
  background: rgba(255, 255, 255, 0.1);
}

.dark-theme :deep(.n-input-input__input-el) {
  color: rgba(255, 255, 255, 0.82) !important;
}

.dark-theme :deep(.n-input-input__placeholder) {
  color: rgba(255, 255, 255, 0.38) !important;
}

:deep(.n-card-header) {
  padding: 20px 20px 0;
}

:deep(.n-card__content) {
  padding: 16px 20px;
}

.dark-theme :deep(.n-checkbox-label),
.dark-theme :deep(.n-radio-label),
.dark-theme .login-header :deep(h2) {
  color: rgba(255, 255, 255, 0.82);
}

.button-group {
  margin-top: 24px;
}

.dark-theme .login-header :deep(h2) {
  color: #fff;
}

:deep(.n-button.n-button--primary-type) {
  background-color: #18a058;
  border-color: #18a058;
  color: #fff !important;
}

.dark-theme :deep(.n-button.n-button--primary-type) {
  background-color: #63e2b7;
  border-color: #63e2b7;
  color: #000 !important;
}

/* 亮色主题文本颜色 */
.light-theme {
  color: #333;
}

.light-theme .login-card :deep(.n-input-input__input-el) {
  color: #333 !important;
}

.light-theme .login-card :deep(.n-input-input__placeholder) {
  color: #999 !important;
}

.light-theme :deep(.n-checkbox-label),
.light-theme :deep(.n-radio-label),
.light-theme .login-header :deep(h2) {
  color: #333;
}

/* 深色主题文本颜色 */
.dark-theme {
  color: rgba(255, 255, 255, 0.82);
}

.dark-theme .login-card :deep(.n-input-input__input-el) {
  color: rgba(255, 255, 255, 0.82) !important;
}

.dark-theme .login-card :deep(.n-input-input__placeholder) {
  color: rgba(255, 255, 255, 0.38) !important;
}

.dark-theme :deep(.n-checkbox-label),
.dark-theme :deep(.n-radio-label),
.dark-theme .login-header :deep(h2),
.dark-theme :deep(.n-radio-button__state-border) {
  color: rgba(255, 255, 255, 0.82);
}

/* 表单项标签颜色 */
.light-theme :deep(.n-form-item-label__text) {
  color: #333 !important;
}

.dark-theme :deep(.n-form-item-label__text) {
  color: rgba(255, 255, 255, 0.82) !important;
}

/* 单选按钮组文本颜色 */
.light-theme :deep(.n-radio-button__state-border) {
  color: #333 !important;
}

.dark-theme :deep(.n-radio-button__state-border) {
  color: #fff !important;
}

/* 单选按钮组未选中状态的文本颜色 */
.light-theme :deep(.n-radio-button:not(.n-radio-button--checked) .n-radio-button__state-border) {
  color: #333 !important;
}

.dark-theme :deep(.n-radio-button:not(.n-radio-button--checked) .n-radio-button__state-border) {
  color: rgba(255, 255, 255, 0.82) !important;
}

/* 单选按钮组选中状态的文本颜色 */
.light-theme :deep(.n-radio-button.n-radio-button--checked .n-radio-button__state-border) {
  color: #18a058 !important;
}

.dark-theme :deep(.n-radio-button.n-radio-button--checked .n-radio-button__state-border) {
  color: #63e2b7 !important;
}

/* 表单项标签和必填星号颜色 */
.light-theme :deep(.n-form-item-label) {
  color: #333 !important;
}

.light-theme :deep(.n-form-item-label__asterisk) {
  color: #d03050 !important;
}

.dark-theme :deep(.n-form-item-label) {
  color: rgba(255, 255, 255, 0.82) !important;
}

.dark-theme :deep(.n-form-item-label__asterisk) {
  color: #e88080 !important;
}

/* 输入框文本颜色 */
.light-theme :deep(.n-input .n-input__input-el) {
  color: #333 !important;
}

.dark-theme :deep(.n-input .n-input__input-el) {
  color: rgba(255, 255, 255, 0.82) !important;
}

/* 输入框占位符颜色 */
.light-theme :deep(.n-input .n-input__placeholder) {
  color: #999 !important;
}

.dark-theme :deep(.n-input .n-input__placeholder) {
  color: rgba(255, 255, 255, 0.38) !important;
}

/* 输入框图标颜色 */
.light-theme :deep(.n-input .n-input__prefix .n-icon) {
  color: #666 !important;
}

.dark-theme :deep(.n-input .n-input__prefix .n-icon) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 复选框文本颜色 */
.light-theme :deep(.n-checkbox .n-checkbox__label) {
  color: #333 !important;
}

.dark-theme :deep(.n-checkbox .n-checkbox__label) {
  color: rgba(255, 255, 255, 0.82) !important;
}

/* 主题切换按钮文本和图标颜色 */
.light-theme :deep(.n-button--quaternary) {
  color: #333 !important;
}

.dark-theme :deep(.n-button--quaternary) {
  color: rgba(255, 255, 255, 0.82) !important;
}

/* 确保所有文本元素都有正确的颜色 */
.light-theme :deep(*) {
  --text-color: #333;
  --text-color-secondary: #666;
}

.dark-theme :deep(*) {
  --text-color: rgba(255, 255, 255, 0.82);
  --text-color-secondary: rgba(255, 255, 255, 0.52);
}

/* 调整表单项间距 */
:deep(.n-form-item) {
  margin-bottom: 12px;
}

/* 特别调整登录方式选择的间距 */
:deep(.n-form-item:first-child) {
  margin-bottom: 8px;
}

/* 调整表单标签和内容的间距 */
:deep(.n-form-item-label) {
  padding-bottom: 2px;
}

/* 调整卡片内容区域的内边距 */
:deep(.n-card__content) {
  padding: 16px 20px;
}

/* 调整记住我和主题切换按钮的上方间距 */
.n-space:not(.vertical) {
  margin: 4px 0 12px !important;
}

/* 调整按钮组的上方间距 */
.n-space.vertical {
  margin-top: 12px !important;
}

/* 调整登录图标和标题的间距 */
.login-header {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 0 0 16px;
}

/* 调整卡片宽度 */
.login-card {
  width: 380px;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 调整按钮之间的间距 */
.n-space.vertical :deep(.n-button) {
  margin-bottom: 12px;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
</style> 