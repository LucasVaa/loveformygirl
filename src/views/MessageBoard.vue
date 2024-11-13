<template>
  <div class="message-board">
    <BackButton />
    <div class="board-container">
      <h2 class="board-title">我们的留言板</h2>
      
      <!-- 留言输入区 -->
      <div class="message-input">
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
          <button @click="addMessage" :disabled="!newMessage.trim()">
            发送 💝
          </button>
        </div>
      </div>

      <!-- 留言展示区 -->
      <div class="message-list">
        <div v-for="(msg, index) in messages" 
             :key="index"
             class="message-item"
             :class="{ 'message-right': msg.isMe }">
          <div class="message-content">
            <div class="message-header">
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
import { ref, onMounted } from 'vue'
import BackButton from '../components/BackButton.vue'

const newMessage = ref('')
const selectedEmoji = ref('😊')
const messages = ref([
  {
    content: '我也想和你一起看星星',
    mood: '🌟',
    time: new Date('2024-01-01 12:05:00'),
    isMe: false
  },
  {
    content: '今天天气真好，想和你一起散步',
    mood: '😊',
    time: new Date('2024-01-01 12:00:00'),
    isMe: true
  }
])

const emojis = ['😊', '🥰', '😘', '💕', '🌟', '🎵']

onMounted(() => {
  const savedMessages = localStorage.getItem('loveMessages')
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages).map(msg => ({
      ...msg,
      time: new Date(msg.time)
    }))
  }
})

const addMessage = () => {
  if (!newMessage.value.trim()) return
  
  const message = {
    content: newMessage.value,
    mood: selectedEmoji.value,
    time: new Date(),
    isMe: true
  }
  
  messages.value.unshift(message)
  localStorage.setItem('loveMessages', JSON.stringify(messages.value))
  
  newMessage.value = ''
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

.message-right {
  justify-content: flex-end;
}

.message-right .message-content {
  background: #ff6b81;
  color: white;
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

.message-right .message-time {
  color: rgba(255,255,255,0.8);
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
</style> 