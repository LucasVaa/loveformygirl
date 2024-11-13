<template>
  <div class="home">
    <div class="heart-container">
      <div class="floating-heart">❤️</div>
    </div>
    
    <!-- 添加倒计时组件 -->
    <div class="love-counter">
      <div class="counter-title">我们已经在一起</div>
      <div class="counter-numbers">
        <div class="counter-item">
          <span class="number">{{ timeCounter.days }}</span>
          <span class="label">天</span>
        </div>
        <div class="counter-item">
          <span class="number">{{ timeCounter.hours }}</span>
          <span class="label">小时</span>
        </div>
        <div class="counter-item">
          <span class="number">{{ timeCounter.minutes }}</span>
          <span class="label">分钟</span>
        </div>
        <div class="counter-item">
          <span class="number">{{ timeCounter.seconds }}</span>
          <span class="label">秒</span>
        </div>
      </div>
    </div>

    <h1 class="title">亲爱的，这是送给你的网站</h1>
    <div class="content">
      <router-link to="/memory" class="memory-btn">我们的回忆</router-link>
      <router-link to="/photos" class="memory-btn">我们的合照</router-link>
      <router-link to="/letter" class="memory-btn">给你的一封信</router-link>
      <router-link to="/messages" class="memory-btn">留言板</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 设置在一起的开始时间
const startDate = new Date('2024-03-17') // 替换成你们在一起的日期

const timeCounter = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

const calculateTime = () => {
  const now = new Date()
  const diff = now - startDate

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  timeCounter.value = {
    days,
    hours,
    minutes,
    seconds
  }
}

let timer

onMounted(() => {
  calculateTime()
  timer = setInterval(calculateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #ffe6e6, #fff0f5);
}

.title {
  color: #ff6b81;
  margin-bottom: 2rem;
}

.floating-heart {
  font-size: 2rem;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.memory-btn {
  display: inline-block;
  padding: 1rem 2rem;
  margin: 1rem;
  border-radius: 25px;
  text-decoration: none;
  color: white;
  background: #ff6b81;
  transition: transform 0.3s;
}

.memory-btn:hover {
  transform: scale(1.1);
}

.love-counter {
  margin-bottom: 2rem;
  text-align: center;
}

.counter-title {
  color: #ff6b81;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.counter-numbers {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.counter-item {
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 1s ease-out;
}

.number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ff6b81;
  margin-bottom: 0.3rem;
}

.label {
  font-size: 0.9rem;
  color: #666;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .counter-numbers {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .counter-item {
    min-width: 60px;
    padding: 0.8rem;
  }

  .number {
    font-size: 1.4rem;
  }

  .label {
    font-size: 0.8rem;
  }
}

/* 添加悬浮效果 */
.counter-item:hover {
  transform: translateY(-5px);
  transition: transform 0.3s ease;
}

/* 可以添加数字变化动画 */
.number {
  transition: all 0.3s ease;
}
</style> 