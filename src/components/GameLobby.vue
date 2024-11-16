<template>
  <n-layout>
    <n-layout-header class="header">
      <div class="header-content">
        <div class="header-left">
          <n-icon size="24" class="logo-icon">
            <game-controller />
          </n-icon>
          <n-h1 class="logo-text">Stellar-联机大厅</n-h1>
        </div>
        <div class="header-right">
          <n-space :size="12">
            <n-button quaternary @click="toggleTheme" class="theme-button">
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
              <span class="button-text">{{ isDark ? '浅色' : '深色' }}主题</span>
            </n-button>
            <n-button type="primary" @click="showCreateRoom = true" class="create-button">
              <template #icon>
                <n-icon><add-circle /></n-icon>
              </template>
              <span class="button-text">创建房间</span>
            </n-button>
            <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
              <n-button quaternary class="user-button">
                <n-avatar
                  :src="authStore.userAvatar"
                  round
                  :size="32"
                />
                <span class="username">{{ authStore.user?.username }}</span>
                <template v-if="authStore.user?.vipTime">
                  <n-tag size="small" type="warning" round class="vip-tag">
                    <span class="vip-text">{{ authStore.user.group }}</span>
                  </n-tag>
                </template>
              </n-button>
            </n-dropdown>
          </n-space>
        </div>
      </div>
    </n-layout-header>
    
    <n-layout-content class="content">
      <room-list />
    </n-layout-content>

    <!-- 创建房间对话框 -->
    <n-modal
      v-model:show="showCreateRoom"
      preset="dialog"
      title="创建房间"
      :style="{ width: '600px' }"
    >
      <create-room @success="handleCreateSuccess" />
    </n-modal>
  </n-layout>
</template>

<script setup>
import { h, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { 
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NH1,
  NSpace,
  NButton,
  NIcon,
  NDropdown,
  NTag,
  NModal,
  NAvatar
} from 'naive-ui'
import {
  GameController,
  PersonCircle,
  AddCircle,
  LogOutOutline,
  Moon,
  Sunny
} from '@vicons/ionicons5'
import { useAuthStore } from '../store/auth'
import { useLobbyStore } from '../store/lobby'
import RoomList from './RoomList.vue'
import CreateRoom from './CreateRoom.vue'

const router = useRouter()
const authStore = useAuthStore()
const lobbyStore = useLobbyStore()
const { rooms } = storeToRefs(lobbyStore)

const showCreateRoom = ref(false)

const handleCreateSuccess = async () => {
  showCreateRoom.value = false
  // 立即刷新房间列表
  await lobbyStore.fetchRooms()
  message.success('房间创建成功')
}

// 计算公开和私密房间数量
const publicRooms = computed(() => rooms.value.filter(room => !room.isPrivate).length)
const privateRooms = computed(() => rooms.value.filter(room => room.isPrivate).length)

const userMenuOptions = computed(() => [
  {
    label: `用户：${authStore.user?.username}`,
    key: 'userInfo',
    disabled: true
  },
  {
    label: `邮箱：${authStore.user?.email}`,
    key: 'email',
    disabled: true
  },
  {
    label: `注册时间：${new Date(authStore.user?.regTime).toLocaleDateString()}`,
    key: 'regTime',
    disabled: true
  },
  ...(authStore.user?.vipTime ? [{
    label: `会员到期：${new Date(authStore.user.vipTime).toLocaleDateString()}`,
    key: 'vipTime',
    disabled: true
  }] : []),
  {
    type: 'divider'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline)
  }
])

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const handleUserMenuSelect = (key) => {
  if (key === 'logout') {
    authStore.logout()
    router.push('/login')
  }
  // 处理其他菜单项...
}

// 主题相关
const isDark = ref(localStorage.getItem('theme') === 'dark')
const toggleTheme = () => {
  window.$toggleTheme?.()
  isDark.value = !isDark.value
}
</script>

<style scoped>
.header {
  height: auto;
  min-height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--body-color);
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  min-height: 48px;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  margin-right: 24px;
}

.logo-text {
  font-size: clamp(18px, 2vw, 24px);
  margin: 0;
  white-space: nowrap;
}

.logo-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 8px;
  min-width: 0;
  height: auto;
}

.username {
  margin: 0 4px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vip-tag {
  flex-shrink: 0;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.vip-text {
  display: inline-block;
  text-align: center;
  width: 100%;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 8px 16px;
  }

  .header-right {
    margin-right: 24px;
  }

  .button-text {
    display: none;
  }

  .theme-button,
  .create-button {
    padding: 4px 8px;
  }

  .user-button {
    padding: 4px 8px;
  }

  .username {
    max-width: 80px;
  }

  .vip-tag {
    min-width: 35px;
    padding: 0 6px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 8px 12px;
    flex-direction: column;
    gap: 12px;
  }

  .header-left,
  .header-right {
    margin: 0;
    width: 100%;
    justify-content: center;
  }

  .username {
    max-width: 60px;
  }

  .vip-tag {
    min-width: 35px;
  }

  .header-right {
    margin-right: 0;
  }
}

/* 确保内容区域不会被头部遮挡 */
.content {
  padding: 24px;
  min-height: calc(100vh - 64px);
}

.sider {
  padding: 24px;
  background: #f5f5f5;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #18a058;
}

:deep(.n-card) {
  transition: all 0.3s ease;
}

:deep(.n-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.n-layout-header) {
  padding: 0 !important;
}

:deep(.n-alert) {
  padding: 12px 16px;
}

:deep(.n-statistic) {
  text-align: center;
}
</style> 