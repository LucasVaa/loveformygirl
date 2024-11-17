<template>
  <div class="message-board">
    <BackButton />
    <div class="board-container">
      <h2 class="board-title">我们的留言板</h2>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- 留言输入区 -->
      <div class="message-input">
        <input 
          v-model="visitorName"
          placeholder="请输入您的姓名"
          class="name-input"
        />
        <textarea 
          v-model="newMessage"
          placeholder="写下你想说的话..."
          :rows="3"
        ></textarea>
        <div class="input-footer">
          <div class="mood-selector">
            <span 
              v-for="emoji in emojis"
              :key="emoji"
              @click="selectEmoji(emoji)"
              :class="{ active: selectedEmoji === emoji }"
            >
              {{ emoji }}
            </span>
          </div>
          <button @click="addMessage" :disabled="!canSubmit">
            发送 💝
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        加载中...
      </div>

      <!-- 留言展示区 -->
      <div v-else class="message-list">
        <div v-for="msg in messages" 
             :key="msg._id"
             class="message-item">
          <div class="message-content">
            <div class="message-header">
              <span class="visitor-name">{{ msg.visitorName }}</span>
              <span class="message-mood">{{ msg.mood }}</span>
              <span class="message-time">{{ formatDate(msg.time) }}</span>
            </div>
            <div class="message-text">{{ msg.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import BackButton from '../components/BackButton.vue'

const visitorName = ref('')
const newMessage = ref('')
const selectedEmoji = ref('😊')
const messages = ref([])
const loading = ref(false)
const error = ref(null)
const emojis = ['😊', '😂', '🥰', '😍', '🤔', '😮', '😢', '🙏']

const API_URL = 'http://110.42.197.57:3000/api'

// 计算属性：检查是否可以提交
const canSubmit = computed(() => {
  return visitorName.value.trim() && newMessage.value.trim()
})

// 获取消息
const fetchMessages = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_URL}/messages`)
    messages.value = response.data.map(msg => ({
      ...msg,
      time: new Date(msg.time)
    }))
  } catch (err) {
    error.value = '获取消息失败'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMessages()
})

// 添加消息
const addMessage = async () => {
  if (!canSubmit.value) return
  
  try {
    const message = {
      visitorName: visitorName.value.trim(),
      content: newMessage.value,
      mood: selectedEmoji.value,
      time: new Date()
    }
    
    await axios.post(`${API_URL}/messages`, message)
    await fetchMessages()
    newMessage.value = ''
  } catch (err) {
    error.value = '发送消息失败'
    console.error(err)
  }
}

const selectEmoji = (emoji) => {
  selectedEmoji.value = emoji
}

const formatDate = (date) => {
  const now = new Date()
  const messageDate = new Date(date)
  
  if (now.toDateString() === messageDate.toDateString()) {
    return messageDate.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  return messageDate.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.message-board {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.board-container {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 2rem;
}

.board-title {
  text-align: center;
  color: #ff6b81;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.message-input {
  background: white;
  border-radius: 15px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

textarea {
  width: 100%;
  border: none;
  resize: none;
  font-size: 1rem;
  padding: 0.5rem;
  outline: none;
  font-family: inherit;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.mood-selector {
  display: flex;
  gap: 0.5rem;
}

.mood-selector span {
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.3rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.mood-selector span.active {
  background: #ffe6e9;
  transform: scale(1.2);
}

button {
  background: #ff6b81;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #ff4d67;
  transform: translateY(-2px);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  display: flex;
  margin-bottom: 1rem;
}

.message-content {
  background: white;
  padding: 1rem;
  border-radius: 15px;
  max-width: 70%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.message-mood {
  font-size: 1.2rem;
}

.message-time {
  color: #666;
}

.message-text {
  line-height: 1.5;
  word-break: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-board {
    padding: 1rem;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .board-title {
    font-size: 1.5rem;
  }

  .input-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .mood-selector {
    width: 100%;
    justify-content: center;
  }

  button {
    width: 100%;
    padding: 0.8rem;
  }
}

/* 添加动画 */
.message-item {
  animation: messageSlide 0.3s ease;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.name-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.name-input:focus {
  border-color: #ff6b81;
}

.visitor-name {
  font-weight: bold;
  color: #ff6b81;
  margin-right: 0.5rem;
}

.message-right .visitor-name {
  color: white;
}
</style> 