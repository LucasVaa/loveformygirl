<template>
  <div class="memory">
    <BackButton />
    <div class="memory-content">
      <h2 class="memory-title">美好回忆</h2>
      <div class="memory-grid">
        <div v-for="(memory, index) in memories" 
             :key="index" 
             class="memory-card"
             @click="showMemory(memory)">
          <div class="image-container">
            <img :src="memory.images[0]" 
                 :alt="memory.title"
                 loading="lazy">
            <div class="image-count" v-if="memory.images.length > 1">
              +{{ memory.images.length - 1 }}
            </div>
          </div>
          <div class="memory-title">{{ memory.title }}</div>
        </div>
      </div>
    </div>

    <div v-if="selectedMemory" 
         class="memory-modal"
         @click.self="closeMemory">
      <div class="modal-content">
        <button class="close-btn" @click="closeMemory">
          <span>&times;</span>
        </button>
        <div class="modal-scroll-container">
          <div class="modal-image-container">
            <div class="image-slider">
              <div class="slider-track" 
                   :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
                <img v-for="(image, index) in selectedMemory.images"
                     :key="index"
                     :src="image" 
                     :alt="`${selectedMemory.title} - ${index + 1}`">
              </div>
              
              <button class="slider-btn prev" 
                      @click.stop="prevImage"
                      v-show="selectedMemory.images.length > 1">
                ❮
              </button>
              <button class="slider-btn next" 
                      @click.stop="nextImage"
                      v-show="selectedMemory.images.length > 1">
                ❯
              </button>

              <div class="image-indicators" v-show="selectedMemory.images.length > 1">
                <span v-for="(_, idx) in selectedMemory.images" 
                      :key="idx"
                      :class="{ active: idx === currentImageIndex }"
                      @click.stop="setCurrentImage(idx)">
                </span>
              </div>
            </div>
          </div>

          <div class="modal-info">
            <h3 class="modal-title">{{ selectedMemory.title }}</h3>
            <div class="modal-date">
              <i class="date-icon">📅</i>
              {{ selectedMemory.date }}
            </div>
            <div class="modal-description">
              <i class="desc-icon">💝</i>
              {{ selectedMemory.description }}
            </div>
            <div class="modal-tags" v-if="selectedMemory.tags?.length">
              <i class="tag-icon">🏷️</i>
              <span v-for="tag in selectedMemory.tags" 
                    :key="tag" 
                    class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BackButton from '../components/BackButton.vue'

const selectedMemory = ref(null)
const currentImageIndex = ref(0)

// 示例数据结构
const memories = [
  {
    title: '我们的第一次约会',
    images: [
      '/images/the-beautiful-girl.png',
      '/images/IMG_4235.JPEG',
      '/images/IMG_4235.JPEG'
    ],
    date: '2024-01-01',
    description: '那天天气真好，你的笑容比阳光还温暖...',
    tags: ['约会', '第一次', '难忘时刻']
  },
  // ... 更多回忆
]

const showMemory = (memory) => {
  selectedMemory.value = memory
  currentImageIndex.value = 0
}

const closeMemory = () => {
  selectedMemory.value = null
  currentImageIndex.value = 0
}

const nextImage = () => {
  if (!selectedMemory.value) return
  currentImageIndex.value = (currentImageIndex.value + 1) % selectedMemory.value.images.length
}

const prevImage = () => {
  if (!selectedMemory.value) return
  currentImageIndex.value = currentImageIndex.value === 0 
    ? selectedMemory.value.images.length - 1 
    : currentImageIndex.value - 1
}

const setCurrentImage = (index) => {
  currentImageIndex.value = index
}

// 键盘导航
const handleKeyDown = (e) => {
  if (!selectedMemory.value) return
  
  switch(e.key) {
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'Escape':
      closeMemory()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.memory {
  padding: 2rem;
  min-height: 100vh;
}

/* 添加内容容器，设置上边距避免被返回按钮遮挡 */
.memory-content {
  margin-top: 60px; /* 为返回按钮留出空间 */
}

.memory-title {
  text-align: center;
  color: #ff6b81;
  margin-bottom: 2rem;
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.memory-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

/* 添加图片容器样式 */
.image-container {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 宽高比 */
  overflow: hidden;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例并填充容器 */
  transition: transform 0.3s ease;
}

/* 添加图片悬浮效果 */
.memory-card:hover .image-container img {
  transform: scale(1.05);
}

.memory-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.memory-card .memory-title {
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #333;
}

.memory-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 90%;
  width: 800px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-scroll-container {
  max-height: 85vh;
  overflow-y: auto;
}

.modal-image-container {
  width: 100%;
  position: relative;
  background: #f5f5f5;
  overflow: hidden;
  max-height: 60vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-image-container img {
  width: 100%;
  height: auto;
  max-height: 60vh;
  object-fit: contain;
}

.modal-info {
  padding: 24px;
  background: white;
}

.modal-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
}

.modal-date {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.modal-description {
  color: #444;
  line-height: 1.8;
  margin: 20px 0;
  font-size: 1rem;
  display: flex;
  gap: 8px;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  align-items: center;
}

.tag {
  background: #fff0f3;
  color: #ff6b81;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.tag:hover {
  background: #ff6b81;
  color: white;
  transform: translateY(-2px);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.close-btn span {
  font-size: 24px;
  color: #ff6b81;
  line-height: 1;
}

.close-btn:hover {
  background: #ff6b81;
  transform: rotate(90deg);
}

.close-btn:hover span {
  color: white;
}

/* 图标样式 */
.date-icon,
.desc-icon,
.tag-icon {
  margin-right: 8px;
  font-size: 1.1rem;
}

/* 滚动条美化 */
.modal-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.modal-scroll-container::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.modal-scroll-container::-webkit-scrollbar-thumb {
  background: #ff6b81;
  border-radius: 3px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }

  .modal-image-container {
    max-height: 50vh;
  }

  .modal-image-container img {
    max-height: 50vh;
  }

  .modal-info {
    padding: 16px;
  }

  .modal-title {
    font-size: 1.3rem;
  }

  .close-btn {
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
  }
}

/* 添加动画 */
.modal-content {
  animation: modalShow 0.3s ease;
}

@keyframes modalShow {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加遮罩层 */
.modal-image-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.03);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-image-container:hover::after {
  opacity: 1;
}

/* 照片数量标记 */
.image-count {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

/* 轮播相关样式 */
.image-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slider-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease-in-out;
}

.slider-track img {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #ff6b81;
  z-index: 10;
}

.slider-btn:hover {
  background: #ff6b81;
  color: white;
}

.slider-btn.prev {
  left: 10px;
}

.slider-btn.next {
  right: 10px;
}

.image-indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.image-indicators span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-indicators span.active {
  background: #ff6b81;
  transform: scale(1.2);
}

/* 添加触摸滑动支持 */
@media (hover: none) {
  .slider-btn {
    display: none;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .image-indicators span {
    width: 6px;
  }
}
</style> 