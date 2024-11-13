<template>
  <div class="back-button" @click="goBack">
    <svg class="back-icon" viewBox="0 0 24 24">
      <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
    </svg>
    <span class="back-text">返回</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.back-button:hover {
  transform: translateX(-5px);
  background: #ff6b81;
}

.back-button:hover .back-icon,
.back-button:hover .back-text {
  color: white;
  fill: white;
}

.back-icon {
  width: 24px;
  height: 24px;
  fill: #ff6b81;
  margin-right: 4px;
}

.back-text {
  color: #ff6b81;
  font-size: 14px;
}

@media (max-width: 768px) {
  .back-button {
    top: 10px;
    left: 10px;
    padding: 6px 12px;
  }
  
  .back-icon {
    width: 20px;
    height: 20px;
  }
  
  .back-text {
    font-size: 12px;
  }
}
</style> 