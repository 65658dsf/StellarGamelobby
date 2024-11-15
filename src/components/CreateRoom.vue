<template>
  <n-form
    ref="formRef"
    :model="formValue"
    :rules="rules"
  >
    <n-form-item label="房间名称" path="roomName">
      <n-input v-model:value="formValue.roomName" placeholder="给您的游戏房间起个名字">
        <template #prefix>
          <n-icon><game-controller /></n-icon>
        </template>
      </n-input>
    </n-form-item>
    
    <n-form-item label="联机地址" path="serverIp" required>
      <n-select
        v-model:value="formValue.serverIp"
        :options="tunnelOptions"
        filterable
        placeholder="请选择联机地址"
      />
    </n-form-item>

    <n-form-item label="游戏名称" path="gameName">
      <n-input v-model:value="formValue.gameName" placeholder="您正在运行的游戏名称（选填）">
        <template #prefix>
          <n-icon><game-controller /></n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-form-item label="房间描述" path="description">
      <n-input
        v-model:value="formValue.description"
        type="textarea"
        placeholder="请输入房间描述（选填）"
        :autosize="{ minRows: 2, maxRows: 4 }"
      />
    </n-form-item>

    <n-collapse>
      <n-collapse-item title="更多选项">
        <template #header>
          <n-space align="center">
            <n-icon><settings-outline /></n-icon>
            <span>更多选项</span>
          </n-space>
        </template>
        
        <n-form-item label="客户端下载地址" path="downloadUrl">
          <n-input 
            v-model:value="formValue.downloadUrl" 
            placeholder="游戏客户端下载地址（选填，需要是完整的 URL）"
          >
            <template #prefix>
              <n-icon><download-outline /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item label="游戏背景图" path="bannerUrl">
          <n-input 
            v-model:value="formValue.bannerUrl" 
            placeholder="游戏背景图片URL地址（选填，建议尺寸 1920x1080，大小不超过2MB）"
          >
            <template #prefix>
              <n-icon><image-outline /></n-icon>
            </template>
          </n-input>
          <template #feedback>
            <n-space vertical :size="2">
              <n-text depth="3">支持 jpg、png、webp 格式，建议尺寸 1920x1080</n-text>
              <div v-if="formValue.bannerUrl" class="banner-preview">
                <n-spin :show="imageLoading">
                  <n-image
                    :src="formValue.bannerUrl"
                    :width="240"
                    object-fit="cover"
                    preview-disabled
                    @load="handleImageLoad"
                    @error="handleImageError"
                    referrerpolicy="no-referrer"
                  />
                </n-spin>
              </div>
            </n-space>
          </template>
        </n-form-item>
      </n-collapse-item>
    </n-collapse>

    <div style="margin-top: 16px">
      <n-button type="primary" block @click="handleCreateRoom" :loading="loading">
        <template #icon>
          <n-icon><add-circle /></n-icon>
        </template>
        创建房间
      </n-button>
    </div>
  </n-form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  NForm, 
  NFormItem, 
  NInput, 
  NButton,
  NIcon,
  NRadio,
  NRadioGroup,
  NSpace,
  NSelect,
  NText,
  NImage,
  NSpin,
  NCollapse,
  NCollapseItem
} from 'naive-ui'
import { 
  GameController,
  LockClosed,
  AddCircle,
  ServerOutline,
  DownloadOutline,
  ImageOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import { useLobbyStore } from '../store/lobby'
import { useAuthStore } from '../store/auth'
import { getUserTunnels } from '../api/tunnel'

const store = useLobbyStore()
const authStore = useAuthStore()
const message = useMessage()
const formRef = ref(null)
const loading = ref(false)

const formValue = ref({
  roomName: '',
  gameName: '',
  description: '',
  serverIp: '',
  downloadUrl: '',
  isPrivate: false,
  password: '',
  bannerUrl: ''
})

const rules = {
  roomName: { 
    required: true, 
    message: '请输入房间名称',
    trigger: ['blur', 'input'],
    validator: (rule, value) => {
      if (!value) {
        return new Error('请输入房间名称')
      }
      if (value.length > 10) {
        return new Error('房间名称不能超过10个字符')
      }
      return true
    }
  },
  serverIp: { 
    required: true,
    message: '请选择或输入联机地址',
    trigger: ['blur', 'input'],
    validator: (rule, value) => {
      if (!value) {
        return new Error('请选择或输入联机地址')
      }
      
      const isTunnelOption = tunnelOptions.value.some(option => option.value === value)
      if (isTunnelOption) {
        return true
      }
      
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/
      if (!ipPattern.test(value)) {
        return new Error('请输入正确的IP地址格式')
      }
      return true
    }
  },
  password: {
    required: true,
    message: '请输入房间密码',
    trigger: ['blur', 'input'],
    validator: (rule, value) => {
      if (formValue.value.isPrivate && !value) {
        return new Error('私密房间需要设置密码')
      }
      if (formValue.value.isPrivate && value.length < 4) {
        return new Error('密码长度至少4位')
      }
      return true
    }
  },
  downloadUrl: {
    trigger: ['blur', 'input'],
    validator: (rule, value) => {
      if (!value) return true // 允许为空
      
      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
          ? true
          : new Error('请输入有效的 http 或 https URL')
      } catch (e) {
        return new Error('请输入有效的完整 URL，例如: https://example.com/download')
      }
    }
  }
}

const tunnels = ref([])
const imageLoading = ref(false)

const tunnelOptions = computed(() => {
  return tunnels.value.map(tunnel => ({
    label: `${tunnel.proxy_name} (${tunnel.link})`,
    value: tunnel.link
  }))
})

const loadTunnels = async () => {
  try {
    const token = authStore.token
    if (!token) {
      message.error('未找到登录凭证，请重新登录')
      return
    }
    const tunnelList = await getUserTunnels(token)
    tunnels.value = tunnelList
  } catch (error) {
    message.error('获取服务器列表失败')
  }
}

const handleImageLoad = async (e) => {
  imageLoading.value = true
  try {
    // 检查图片尺寸
    const img = e.target
    if (img.naturalWidth < 800 || img.naturalHeight < 450) {
      message.warning('建议使用更大尺寸的图片（建议 1920x1080）')
    }

    // 使用 XMLHttpRequest 来获取图片大小
    const xhr = new XMLHttpRequest()
    xhr.open('HEAD', formValue.value.bannerUrl, true)
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const size = xhr.getResponseHeader('Content-Length')
          const sizeInMB = size / (1024 * 1024)
          if (sizeInMB > 2) {
            message.error('图片大小不能超过2MB')
            formValue.value.bannerUrl = ''
          }
        }
      }
    }
    xhr.onerror = () => {
      console.warn('无法获取图片大小信息')
    }
    xhr.send(null)

  } catch (error) {
    console.warn('图片大小检查失败:', error)
  } finally {
    imageLoading.value = false
  }
}

const handleImageError = () => {
  if (formValue.value.bannerUrl) {
    message.error('图片加载失败，请尝试使用支持跨域的图床')
    formValue.value.bannerUrl = ''
  }
  imageLoading.value = false
}

onMounted(() => {
  loadTunnels()
})

const handleCreateRoom = async () => {
  try {
    loading.value = true
    await formRef.value?.validate()
    
    const roomData = {
      roomName: formValue.value.roomName,
      gameName: formValue.value.gameName || '未指定',
      description: formValue.value.description,
      serverIp: formValue.value.serverIp,
      downloadUrl: formValue.value.downloadUrl,
      isPrivate: formValue.value.isPrivate,
      password: formValue.value.isPrivate ? formValue.value.password : null,
      hostId: authStore.user.id,
      hostName: authStore.user.username,
      bannerUrl: formValue.value.bannerUrl
    }
    
    await store.createRoom(roomData)
    message.success('房间创建成功')
    
    // 重置表单
    formValue.value = {
      roomName: '',
      gameName: '',
      description: '',
      serverIp: '',
      downloadUrl: '',
      isPrivate: false,
      password: '',
      bannerUrl: ''
    }
  } catch (error) {
    message.error(error.message || '创建房间失败，请检查输入并重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.banner-preview {
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
  width: 240px;
}

:deep(.n-image) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.n-image img) {
  height: 135px;
  object-fit: cover;
}

:deep(.n-collapse-item .n-collapse-item__header) {
  font-size: 14px;
  padding: 12px 0;
}

:deep(.n-collapse) {
  margin: 16px 0;
  border-radius: 8px;
}
</style> 