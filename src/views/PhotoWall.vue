<template>
  <div class="photo-wall">
    <BackButton />
    <h2 class="wall-title">我们的合照</h2>
    
    <div class="photo-grid">
      <div v-for="(photo, index) in photos" 
           :key="index"
           class="photo-item"
           :class="photo.size"
           @click="showPhoto(index)">
        <img :src="photo.url" 
             :alt="photo.description"
             loading="lazy">
        <div class="photo-info">
          <div class="photo-date">{{ photo.date }}</div>
          <div class="photo-description">{{ photo.description }}</div>
        </div>
      </div>
    </div>

    <!-- 照片查看器 -->
    <div v-if="selectedIndex !== null" 
         class="photo-viewer"
         @click.self="closeViewer">
      <div class="viewer-content">
        <button class="close-btn" @click="closeViewer">×</button>
        <img :src="photos[selectedIndex].url" 
             :alt="photos[selectedIndex].description">
        <div class="viewer-info">
          <div class="viewer-date">{{ photos[selectedIndex].date }}</div>
          <div class="viewer-description">{{ photos[selectedIndex].description }}</div>
        </div>
        <button class="nav-btn prev" 
                @click.stop="prevPhoto" 
                v-show="selectedIndex > 0">❮</button>
        <button class="nav-btn next" 
                @click.stop="nextPhoto"
                v-show="selectedIndex < photos.length - 1">❯</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BackButton from '../components/BackButton.vue'

const selectedIndex = ref(null)

// 照片数据
const photos = [
  {
    url: '/images/the-beautiful-girl.png',
    date: '2024-01-01',
    description: '第一次约会',
    size: 'large' // 大尺寸
  },
  {
    url: '/images/the-beautiful-girl.png',
    date: '2024-02-14',
    description: '情人节快乐',
    size: 'medium' // 中等尺寸
  },
  {
    url: '/images/the-beautiful-girl.png',
    date: '2024-03-01',
    description: '一起看日落',
    size: 'small' // 小尺寸
  },
  // ... 更多照片
]

const showPhoto = (index) => {
  selectedIndex.value = index
}

const closeViewer = () => {
  selectedIndex.value = null
}

const prevPhoto = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const nextPhoto = () => {
  if (selectedIndex.value < photos.length - 1) {
    selectedIndex.value++
  }
}
</script>

<style scoped>
.photo-wall {
  padding: 2rem;
  min-height: 100vh;
  background: #f5f5f5;
}

.wall-title {
  text-align: center;
  color: #ff6b81;
  margin: 2rem 0;
  font-size: 2rem;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.photo-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-item.large {
  grid-column: span 2;
  grid-row: span 2;
}

.photo-item.medium {
  grid-column: span 2;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item:hover .photo-info {
  opacity: 1;
}

.photo-item:hover img {
  transform: scale(1.05);
}

.photo-date {
  font-size: 0.8rem;
  opacity: 0.8;
}

.photo-description {
  margin-top: 0.5rem;
  font-size: 1rem;
}

/* 查看器样式 */
.photo-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.viewer-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.viewer-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.viewer-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: rgba(0,0,0,0.7);
  color: white;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 1rem;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.3);
}

.nav-btn.prev {
  left: 1rem;
}

.nav-btn.next {
  right: 1rem;
}

.close-btn {
  position: absolute;
  top: -2rem;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .photo-item.large,
  .photo-item.medium {
    grid-column: span 1;
    grid-row: span 1;
  }

  .nav-btn {
    padding: 0.5rem;
    font-size: 1.2rem;
  }
}
</style> 