<template>
  <div class="chat-container">
    <div class="messages" ref="messagesRef">
      <n-timeline>
        <n-timeline-item
          v-for="msg in store.messages"
          :key="msg.id"
          :type="getMessageType(msg)"
          :title="msg.sender"
          :content="msg.content"
          :time="msg.time"
        />
      </n-timeline>
    </div>
    
    <n-input-group>
      <n-input
        v-model:value="messageInput"
        type="text"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
      />
      <n-button type="primary" @click="sendMessage" :loading="sending">
        发送
      </n-button>
    </n-input-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import { useLobbyStore } from '../store/lobby'
import { useAuthStore } from '../store/auth'
import { 
  NTimeline, 
  NTimelineItem, 
  NInput, 
  NInputGroup, 
  NButton 
} from 'naive-ui'

const store = useLobbyStore()
const authStore = useAuthStore()
const message = useMessage()
const messageInput = ref('')
const sending = ref(false)
const messagesRef = ref(null)

onMounted(() => {
  if (!store.wsConnected && authStore.token) {
    store.initializeWebSocket(authStore.token)
  }
  scrollToBottom()
})

onUnmounted(() => {
  store.cleanup()
})

const sendMessage = async () => {
  if (!messageInput.value.trim()) return
  
  try {
    sending.value = true
    store.sendMessage(messageInput.value)
    messageInput.value = ''
    await scrollToBottom()
  } catch (error) {
    message.error('发送消息失败')
  } finally {
    sending.value = false
  }
}

const getMessageType = (msg) => {
  if (msg.sender === '系统') return 'info'
  if (msg.sender === authStore.user.username) return 'success'
  return 'default'
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

watch(() => store.messages.length, scrollToBottom)
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  margin-bottom: 16px;
}

.n-input-group {
  display: flex;
  gap: 8px;
}

:deep(.n-timeline-item--success) {
  .n-timeline-item-content {
    background: #e8f5e9;
    padding: 8px 12px;
    border-radius: 8px;
  }
}

:deep(.n-timeline-item--info) {
  .n-timeline-item-content {
    color: #666;
    font-style: italic;
  }
}
</style> 