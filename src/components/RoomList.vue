<template>
  <div class="room-list-container">
    <n-space vertical size="large">
      <n-card>
        <template #header>
          <n-space justify="space-between" align="center">
            <n-space>
              <n-icon size="20">
                <list-circle />
              </n-icon>
              <span>房间列表</span>
            </n-space>
            <n-space>
              <n-input
                v-model:value="searchQuery"
                placeholder="搜索房间名/游戏名/房主/描述..."
                clearable
                style="width: 250px"
              >
                <template #prefix>
                  <n-icon><search /></n-icon>
                </template>
              </n-input>
              <n-button 
                type="default" 
                @click="refreshRooms"
                :loading="loading"
                :disabled="cooldownRemaining > 0"
              >
                <template #icon>
                  <n-icon><refresh /></n-icon>
                </template>
                {{ cooldownRemaining > 0 ? `${cooldownRemaining}秒` : '刷新列表' }}
              </n-button>
            </n-space>
          </n-space>
        </template>

        <n-grid :x-gap="16" :y-gap="16" cols="2">
    <n-grid-item v-for="room in filteredRooms" :key="room.id">
      <n-card 
        hoverable 
        :class="{ 'my-room': room.hostName === authStore.user?.username }"
        :style="room.bannerUrl ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url('${room.bannerUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}"
      >
        <template #header>
          <n-space justify="space-between" align="center">
            <n-space>
              <span class="room-name" :style="room.bannerUrl ? { color: '#fff' } : {}">
                {{ room.roomName }}
              </span>
              <n-tag :type="room.isPrivate === 1 ? 'warning' : 'success'">
                {{ room.isPrivate === 1 ? '私密' : '公开' }}
              </n-tag>
            </n-space>
            <n-button 
              type="primary"
              @click="handleViewRoom(room)"
              size="small"
            >
              查看详情
            </n-button>
          </n-space>
        </template>
        <n-space vertical>
          <n-space align="center">
            <n-icon size="16" :style="room.bannerUrl ? { color: '#fff' } : {}">
              <game-controller />
            </n-icon>
            <span :style="room.bannerUrl ? { color: '#fff' } : {}">
              {{ room.game_name || room.gameName || '未指定' }}
            </span>
          </n-space>
          <n-space align="center">
            <n-icon size="16" :style="room.bannerUrl ? { color: '#fff' } : {}">
              <person />
            </n-icon>
            <span :style="room.bannerUrl ? { color: '#fff' } : {}">
              房主：{{ room.host_name || room.hostName }}
            </span>
          </n-space>
          <n-space align="center">
            <n-icon size="16" :style="room.bannerUrl ? { color: '#fff' } : {}">
              <time />
            </n-icon>
            <span :style="room.bannerUrl ? { color: '#fff' } : {}">
              创建时间：{{ room.created_at }}
            </span>
          </n-space>
        </n-space>
      </n-card>
    </n-grid-item>
  </n-grid>
        <template #footer>
          <n-space justify="space-between">
            <span>共 {{ rooms.length }} 个房间</span>
            <n-space>
              <n-statistic label="公开房间" :value="publicRooms" />
              <n-divider vertical />
              <n-statistic label="私密房间" :value="privateRooms" />
            </n-space>
          </n-space>
        </template>
      </n-card>
    </n-space>

    <!-- 房间详情对话框 -->
    <n-modal
      v-model:show="showDetails"
      preset="card"
      title="房间详情"
      :style="{ width: '500px' }"
    >
      <template #header>
        <n-space align="center">
          <n-icon size="24"><game-controller /></n-icon>
          <span>{{ selectedRoom?.roomName }}</span>
          <n-tag :type="selectedRoom?.isPrivate === 1 ? 'warning' : 'success'">
            {{ selectedRoom?.isPrivate === 1 ? '私密' : '公开' }}
          </n-tag>
        </n-space>
      </template>

      <n-descriptions bordered>
        <n-descriptions-item label="游戏名称">
          {{ selectedRoom?.gameName || '未指定' }}
        </n-descriptions-item>
        <n-descriptions-item label="房主">
          {{ selectedRoom?.hostName }}
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">
          {{ selectedRoom?.created_at }}
        </n-descriptions-item>
        <n-descriptions-item v-if="selectedRoom?.description" label="房间描述">
          {{ selectedRoom?.description }}
        </n-descriptions-item>
        <n-descriptions-item v-if="selectedRoom?.serverIp" label="服务器IP">
          <n-text copyable>{{ selectedRoom?.serverIp }}</n-text>
        </n-descriptions-item>
        <n-descriptions-item v-if="selectedRoom?.downloadUrl" label="客户端下载">
          <n-button 
            text 
            type="primary" 
            tag="a" 
            :href="ensureAbsoluteUrl(selectedRoom.downloadUrl)" 
            target="_blank"
          >
            <template #icon>
              <n-icon><download-outline /></n-icon>
            </template>
            点击下载
          </n-button>
        </n-descriptions-item>
      </n-descriptions>

      <template #footer>
        <n-space justify="end">
          <n-popconfirm
            v-if="selectedRoom?.hostName === authStore.user?.username"
            @positive-click="handleDeleteRoom"
            negative-text="取消"
            positive-text="确认删除"
          >
            <template #trigger>
              <n-button type="error">
                删除房间
              </n-button>
            </template>
            确定要删除这个房间吗？
          </n-popconfirm>
          <n-button @click="showDetails = false">
            关闭
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 密码输入对话框 -->
    <n-modal
      v-model:show="showPasswordInput"
      preset="dialog"
      title="输入房间密码"
      positive-text="确认"
      negative-text="取消"
      @positive-click="handlePasswordSubmit"
      @negative-click="cancelPasswordInput"
    >
      <n-input
        v-model:value="inputPassword"
        type="password"
        placeholder="请输入房间密码"
        @keyup.enter="handlePasswordSubmit"
      >
        <template #prefix>
          <n-icon><lock-closed /></n-icon>
        </template>
      </n-input>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLobbyStore } from '../store/lobby'
import { useAuthStore } from '../store/auth'
import { useMessage } from 'naive-ui'
import { api } from '../utils/api'
import { 
  NCard, 
  NSpace, 
  NButton, 
  NIcon, 
  NTag, 
  NText,
  NInput,
  NGrid,
  NGridItem,
  NStatistic,
  NDivider,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NPopconfirm
} from 'naive-ui'
import {
  GameController,
  Search,
  Refresh,
  Person,
  Time,
  ListCircle,
  DownloadOutline,
  LockClosed
} from '@vicons/ionicons5'

const store = useLobbyStore()
const authStore = useAuthStore()
const message = useMessage()
const { rooms } = storeToRefs(store)
const searchQuery = ref('')
const loading = ref(false)
const lastRefreshTime = ref(0)
const refreshCooldown = 5000
const showDetails = ref(false)
const selectedRoom = ref(null)
const showPasswordInput = ref(false)
const inputPassword = ref('')
const pendingRoom = ref(null)
const cooldownRemaining = ref(0)
const refreshTimer = ref(null)

// 计算公开和私密房间数量
const publicRooms = computed(() => {
  if (!rooms.value) return 0
  return rooms.value.filter(room => room && room.isPrivate === 0).length
})

const privateRooms = computed(() => {
  if (!rooms.value) return 0
  return rooms.value.filter(room => room && room.isPrivate === 1).length
})

// 修改过滤房间列表的计算属性
const filteredRooms = computed(() => {
  if (!store.rooms) return []
  
  let roomsList = [...store.rooms]
  
  // 将房间分为两组：自己的房间和其他房间
  const myRooms = roomsList.filter(room => 
    room.host_name === authStore.user?.username || 
    room.hostName === authStore.user?.username
  )
  const otherRooms = roomsList.filter(room => 
    room.host_name !== authStore.user?.username && 
    room.hostName !== authStore.user?.username
  )
  
  // 对每组分别按创建时间排序
  myRooms.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  otherRooms.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  
  // 合并两组房间，自己的房间在前面
  let sortedRooms = [...myRooms, ...otherRooms]
  
  // 如果有搜索关键词，在排序后进行过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    sortedRooms = sortedRooms.filter(room => {
      if (!room) return false
      
      const searchableFields = {
        '房间名': room.room_name || room.roomName,
        '游戏名': room.game_name || room.gameName,
        '房主': room.host_name || room.hostName,
        '描述': room.description,
        'IP': room.server_ip,
        '下载地址': room.download_url,
        '创建时间': room.created_at,
        '类型': room.isPrivate === 1 ? '私密' : '公开',
        '标记': room.host_name === authStore.user?.username ? '我的房间' : ''
      }
      
      const searchText = Object.values(searchableFields)
        .filter(field => field != null && field !== undefined && field !== '')
        .map(field => String(field).toLowerCase().trim())
        .join(' ')
      
      return query.split(/\s+/).every(keyword => searchText.includes(keyword))
    })
  }
  
  return sortedRooms
})

// 修改刷新房间列表函数
const refreshRooms = async () => {
  const now = Date.now()
  const timeSinceLastRefresh = now - lastRefreshTime.value
  
  if (timeSinceLastRefresh < refreshCooldown && !loading.value) {
    cooldownRemaining.value = Math.ceil((refreshCooldown - timeSinceLastRefresh) / 1000)
    message.warning(`请等待 ${cooldownRemaining.value} 秒后再刷新`)
    return
  }
  
  try {
    loading.value = true
    await store.fetchRooms()
    lastRefreshTime.value = now
    cooldownRemaining.value = 0
    message.success('刷新成功')
  } catch (error) {
    message.error('刷新房间列表失败')
  } finally {
    loading.value = false
  }
}

// 组件加载时获取房间列表
onMounted(async () => {
  await refreshRooms()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})

// 加入房间
const joinRoom = (room) => {
  store.joinRoom(room.id)
}

const showRoomDetails = (room) => {
  selectedRoom.value = room
  showDetails.value = true
}

const handleDeleteRoom = async () => {
  try {
    await store.deleteRoom(selectedRoom.value.id)
    message.success('房间删除成功')
    showDetails.value = false
    refreshRooms()
  } catch (error) {
    message.error(error.message || '删除房间失败')
  }
}

// 处理查看房间
const handleViewRoom = (room) => {
  if (room.isPrivate === 1 && room.hostName !== authStore.user?.username) {
    // 如果是私密房间且不是房主，需要输入密码
    pendingRoom.value = room
    showPasswordInput.value = true
    inputPassword.value = ''
  } else {
    // 如果是公开房间或者是房主，直接显示详情
    showRoomDetails(room)
  }
}

// 处理密码提交
const handlePasswordSubmit = async () => {
  if (!inputPassword.value) {
    message.error('请输入密码')
    return
  }

  try {
    // 验证房间密码
    const response = await api.rooms.verifyPassword({
      roomId: pendingRoom.value.id,
      password: inputPassword.value
    })

    if (response.code === 200) {
      showPasswordInput.value = false
      showRoomDetails(pendingRoom.value)
    } else {
      message.error('密码错误')
    }
  } catch (error) {
    message.error(error.message || '密码验证失败')
  }
}

// 取消密码输入
const cancelPasswordInput = () => {
  showPasswordInput.value = false
  pendingRoom.value = null
  inputPassword.value = ''
}

// 确保 URL 是绝对路径
const ensureAbsoluteUrl = (url) => {
  if (!url) return ''
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
}
</script>

<style scoped>
.room-list-container {
  height: 100%;
}

.room-name {
  font-weight: 500;
  font-size: 16px;
}

:deep(.n-card) {
  transition: all 0.3s ease;
}

:deep(.n-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.my-room {
  position: relative;
}

.my-room::after {
  content: '我的房间';
  position: absolute;
  top: 0;
  right: 0;
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  font-size: 12px;
  transform: translate(30%, -30%) rotate(45deg) translateX(30%);
  transform-origin: center;
  width: 120px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

:deep(.n-card[style*="background-image"]) {
  position: relative;
  border: none !important;
  overflow: hidden;
}

:deep(.n-card[style*="background-image"])::before {
  display: none;
}

:deep(.n-card[style*="background-image"]) .n-card__content,
:deep(.n-card[style*="background-image"]) .n-card-header {
  position: relative;
  z-index: 1;
  background: transparent !important;
}

:deep(.n-card[style*="background-image"]) .n-button {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.n-card[style*="background-image"]) .n-tag {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.n-card[style*="background-image"]) .room-name,
:deep(.n-card[style*="background-image"]) .n-space {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

:root {
  --primary-color-rgb: 24, 160, 88;
}

.dark-theme {
  --primary-color-rgb: 99, 226, 183;
}

:deep(.n-tag) {
  font-weight: 500;
}

.my-room :deep(.n-tag--primary) {
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

.my-room :deep(.n-card__content) {
  background: linear-gradient(
    to bottom right,
    rgba(var(--primary-color-rgb), 0.05),
    transparent
  );
}

:deep(.n-card[style*="background-image"]) {
  background-color: transparent !important;
  border: none !important;
}

:deep(.n-card[style*="background-image"])::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7));
  z-index: 0;
}

:deep(.n-card[style*="background-image"]) .n-card__content,
:deep(.n-card[style*="background-image"]) .n-card-header {
  position: relative;
  z-index: 1;
  background: transparent !important;
}

:deep(.n-card[style*="background-image"]) .n-button,
:deep(.n-card[style*="background-image"]) .n-tag {
  color: #fff !important;
}

.my-room[style*="background-image"] {
  border: none !important;
}

.my-room[style*="background-image"]::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 50px 50px 0;
  border-color: transparent var(--primary-color) transparent transparent;
  z-index: 2;
}

.my-room::after {
  display: none;
}
</style> 