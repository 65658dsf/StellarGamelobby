<template>
  <n-layout>
    <n-layout-header class="header">
      <div class="header-content">
        <div class="header-left">
          <n-icon size="24" class="logo-icon">
            <game-controller />
          </n-icon>
          <n-h1>Stellar-联机大厅</n-h1>
        </div>
        <div class="header-right">
          <n-button quaternary @click="toggleTheme">
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
          <n-button type="primary" @click="showCreateRoom = true">
            <template #icon>
              <n-icon><add-circle /></n-icon>
            </template>
            创建房间
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
                <n-tag size="small" type="warning" round>
                  {{ authStore.user.group }}
                </n-tag>
              </template>
            </n-button>
          </n-dropdown>
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

const handleCreateSuccess = () => {
  showCreateRoom.value = false
  // 刷新房间列表
  lobbyStore.fetchRooms()
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
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: #18a058;
}

.sider {
  padding: 24px;
  background: #f5f5f5;
}

.content {
  padding: 24px;
  min-height: calc(100vh - 64px);
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

.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

:deep(.n-alert) {
  padding: 12px 16px;
}

:deep(.n-statistic) {
  text-align: center;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
}

.username {
  margin: 0 4px;
}
</style> 