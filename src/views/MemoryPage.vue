<template>
  <div class="memory">
    <div class="nav-bar">
      <BackButton />
    </div>
    <h2 class="page-title">美好回忆</h2>
    <div class="header-actions">
      <button class="create-btn" @click="showCreateModal = true">
        <span class="btn-icon">✨</span>
        创建新回忆
      </button>
    </div>

    <!-- 回忆列表 - 添加无限滚动 -->
    <div class="memory-grid" 
         v-infinite-scroll="loadMore"
         :infinite-scroll-disabled="loading || !hasMore"
         :infinite-scroll-distance="100"
         :infinite-scroll-immediate-check="true"
         infinite-scroll-watch-enabled>
      <div v-for="memory in memories" 
           :key="memory._id" 
           class="memory-card"
           @click="showMemory(memory)">
        <div class="image-container">
          <!-- 使用懒加载和缩略图 -->
          <img v-lazy="getThumbUrl(memory.images[0])"
               :alt="memory.title"
               loading="lazy">
          <div v-if="memory.images.length > 1" 
               class="image-badge">
            <span class="image-icon">🖼</span>
            {{ memory.images.length }}
          </div>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ memory.title }}</h3>
          <div class="card-date">{{ formatDate(memory.date) }}</div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-spinner />
    </div>

    <!-- 无更多数据提示 -->
    <div v-if="!hasMore && !loading && memories.length > 0" class="no-more">
      期待添加更多回忆
    </div>

    <!-- 添加创建回忆的模态框 -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h3 class="modal-title">创建新回忆</h3>
        <button class="close-btn" @click="showCreateModal = false">&times;</button>
        
        <form @submit.prevent="createMemory" class="memory-form">
          <div class="form-group">
            <label>标题</label>
            <input v-model="newMemory.title" 
                   type="text" 
                   placeholder="给这个回忆起个名字吧"
                   required>
          </div>
          
          <div class="form-group date-group">
            <label>日期</label>
            <el-date-picker
              v-model="newMemory.date"
              type="date"
              placeholder="选择日期"
              format="YYYY年MM月DD日"
              value-format="YYYY-MM-DD"
              :size="size"
              class="custom-date-picker"
            />
          </div>
          
          <div class="form-group">
            <label>图片</label>
            <div class="image-upload-container">
              <label class="image-upload-btn">
                <input type="file" 
                       @change="handleImageUpload" 
                       multiple 
                       accept="image/*"
                       class="hidden-input">
                <span class="upload-icon">📸</span>
                <span>选择图片</span>
              </label>
              
              <!-- 图片预览区域 -->
              <div class="image-preview-grid" v-if="imagePreviewUrls.length">
                <div v-for="(url, index) in imagePreviewUrls" 
                     :key="index" 
                     class="preview-item">
                  <img :src="url" alt="预览图">
                  <button type="button" 
                          class="remove-image" 
                          @click="removeImage(index)">×</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="newMemory.description" 
                      rows="4"
                      placeholder="写下这个回忆的故事..."></textarea>
          </div>

          <button type="submit" 
                  class="submit-btn"
                  :disabled="!newMemory.images.length">
            保存回忆
          </button>
        </form>
      </div>
    </div>

    <!-- 添加回忆查看器 -->
    <div v-if="selectedMemory" 
         class="memory-viewer"
         @click.self="closeViewer">
      <div class="viewer-content">
        <button class="close-btn" @click="closeViewer">×</button>
        
        <div class="viewer-header">
          <h3>{{ selectedMemory.title }}</h3>
          <div class="viewer-date">{{ formatDate(selectedMemory.date) }}</div>
        </div>

        <div class="viewer-body">
          <div class="viewer-main">
            <div class="main-image">
              <!-- 使用高质量图片 -->
              <img v-lazy="getOriginalUrl(selectedMemory.images[currentImageIndex])"
                   :alt="selectedMemory.title"
                   @load="imageLoaded = true">
              <!-- 加载占位符 -->
              <div v-if="!imageLoaded" class="image-placeholder">
                <el-spinner />
              </div>
              
              <button class="nav-btn prev" 
                      @click.stop="prevImage" 
                      v-show="currentImageIndex > 0">❮</button>
              <button class="nav-btn next" 
                      @click.stop="nextImage"
                      v-show="currentImageIndex < selectedMemory.images.length - 1">❯</button>
              
              <div class="image-counter">
                {{ currentImageIndex + 1 }} / {{ selectedMemory.images.length }}
              </div>
            </div>

            <div class="viewer-info">
              <div class="info-section">
                <h4>照片集 ({{ selectedMemory.images.length }})</h4>
                <div class="thumbnail-grid">
                  <div v-for="(image, index) in selectedMemory.images"
                       :key="index"
                       class="thumbnail"
                       :class="{ active: index === currentImageIndex }"
                       @click="currentImageIndex = index">
                    <img v-lazy="getThumbUrl(image)" 
                         :alt="`照片 ${index + 1}`">
                  </div>
                </div>
              </div>

              <div class="info-section">
                <h4>关于这个回忆</h4>
                <p class="memory-description">{{ selectedMemory.description || '暂无描述' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElSpinner } from 'element-plus'
import BackButton from '../components/BackButton.vue'
import 'element-plus/dist/index.css'
import { ElDatePicker } from 'element-plus'

const API_URL = 'http://110.42.197.57:3000/api'
const memories = ref([])
const showCreateModal = ref(false)
const error = ref('')
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const imageLoaded = ref(false)

const newMemory = ref({
  title: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
  images: []
})

// 添加图片预览 URL 数组
const imagePreviewUrls = ref([])

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  newMemory.value.images = [...newMemory.value.images, ...files]
  
  // 生成预览URL
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviewUrls.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

// 添加删除图片功能
const removeImage = (index) => {
  newMemory.value.images.splice(index, 1)
  imagePreviewUrls.value.splice(index, 1)
}

const createMemory = async () => {
  try {
    // 先上传图片
    const formData = new FormData()
    newMemory.value.images.forEach(image => {
      formData.append('images', image)
    })

    const uploadResponse = await axios.post(`${API_URL}/memories/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // 创建回忆
    const memoryData = {
      title: newMemory.value.title,
      date: newMemory.value.date,
      description: newMemory.value.description,
      imageIds: uploadResponse.data.imageIds
    }

    await axios.post(`${API_URL}/memories`, memoryData)

    // 重置表单和关闭模态框
    newMemory.value = {
      title: '',
      date: '',
      description: '',
      images: []
    }
    imagePreviewUrls.value = []
    showCreateModal.value = false
    
    // 刷新回忆列表
    await fetchMemories()
  } catch (err) {
    console.error('Create memory error:', err)
    error.value = '创建回忆失败'
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const selectedMemory = ref(null)
const currentImageIndex = ref(0)

const showMemory = (memory) => {
  selectedMemory.value = memory
  currentImageIndex.value = 0
  imageLoaded.value = false
  // 禁止背景滚动
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}

const closeViewer = () => {
  selectedMemory.value = null
  currentImageIndex.value = 0
  imageLoaded.value = false
  // 恢复背景滚动
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const nextImage = () => {
  if (currentImageIndex.value < selectedMemory.value.images.length - 1) {
    currentImageIndex.value++
  }
}

const fetchMemories = async () => {
  try {
    const response = await axios.get(`${API_URL}/memories`)
    memories.value = response.data
  } catch (err) {
    console.error('Fetch memories error:', err)
    error.value = '获取回忆列表失败'
  }
}

onMounted(() => {
  // 重置状态
  page.value = 1
  memories.value = []
  hasMore.value = true
  loadMore()
})

// 日期选择器配置
const size = ref('large')

// 获取缩略图URL
const getThumbUrl = (imageUrl) => {
  if (!imageUrl) return ''
  return `${imageUrl}?size=thumb`
}

// 获取原图URL
const getOriginalUrl = (imageUrl) => {
  if (!imageUrl) return ''
  return `${imageUrl}?size=original`
}

const ITEMS_PER_PAGE = 10  // 定义每页加载数量

// 修改加载更多函数
const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  
  try {
    loading.value = true
    console.log('Loading page:', page.value) // 调试日志

    const response = await axios.get(`${API_URL}/memories`, {
      params: {
        page: page.value,
        limit: ITEMS_PER_PAGE  // 使用常量
      }
    })
    
    const newMemories = response.data
    console.log('Loaded memories:', newMemories.length) // 调试日志
    
    // 如果返回的数据少于每页数量，说明没有更多数据了
    if (newMemories.length < ITEMS_PER_PAGE) {
      hasMore.value = false
    }
    
    // 将新数据添加到现有数据后面
    memories.value = [...memories.value, ...newMemories]
    page.value++
  } catch (err) {
    console.error('加载更多失败:', err)
    hasMore.value = false  // 出错时也设置为没有更多数据
  } finally {
    loading.value = false
  }
}

// ... 其他代码 ...
</script>

<style scoped>
.memory {
  padding: 2rem;
  min-height: 100vh;
  background: #f5f5f5;
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.nav-bar {
  margin-bottom: 1rem;
}

.page-title {
  text-align: center;
  color: #ff6b81;
  margin: 2rem 0;
  font-size: 2rem;
}

.header-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ff6b81, #ffa5b1);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(255, 107, 129, 0.2);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 129, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
  min-height: 100px;
  padding-bottom: 20px;
}

.memory-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 280px;
  display: flex;
  flex-direction: column;
}

.memory-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff6b81;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.image-icon {
  font-size: 1.2rem;
}

.card-content {
  padding: 0.8rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-date {
  font-size: 0.85rem;
  color: #666;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  color: #ff6b81;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #ff6b81;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #444;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #ff6b81;
  outline: none;
}

.submit-btn {
  background: #4CAF50;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.submit-btn:hover {
  background: #45a049;
}

.memory-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.viewer-content {
  width: 1000px;
  height: 85vh;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  max-height: 100vh;
}

.viewer-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.viewer-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.viewer-date {
  color: #666;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.viewer-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.viewer-main {
  height: 100%;
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
}

.main-image {
  width: 640px;
  position: relative;
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-counter {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff6b81;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  overflow: hidden;
  touch-action: none;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  flex-shrink: 0;
  border: 2px solid transparent;
}

.thumbnail.active {
  opacity: 1;
  border-color: #ff6b81;
}

.thumbnail:hover {
  opacity: 0.8;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #333;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.nav-btn.prev {
  left: 1rem;
}

.nav-btn.next {
  right: 1rem;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #666;
}

.viewer-info {
  width: 280px;
  flex-shrink: 0;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 1100px) {
  .viewer-content {
    width: 90vw;
  }
}

@media (max-width: 768px) {
  .viewer-content {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .viewer-main {
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.5rem;
    height: auto;
  }

  .main-image {
    width: 100%;
    height: 40vh;
    margin: 0;
  }

  .viewer-info {
    width: 100%;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  }

  .viewer-header {
    padding: 1rem;
  }

  .viewer-header h3 {
    font-size: 1.2rem;
  }

  .thumbnail {
    width: 60px;
    height: 60px;
  }

  .thumbnail-grid {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .image-counter {
    font-size: 0.8rem;
    padding: 0.1rem 0.4rem;
  }

  .close-btn {
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1.5rem;
  }
}

/* 添加滑动手势支持的样式 */
.viewer-body {
  touch-action: pan-y pinch-zoom;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .memory-card {
    height: 220px;
  }

  .image-container {
    height: 140px;
  }
}

/* 更新日历样式 */
:deep(.el-input__wrapper) {
  border: 2px solid #ff6b81 !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  padding: 0.5rem;
}

:deep(.el-input__wrapper:hover) {
  border-color: #ff8c9a !important;
  box-shadow: 0 2px 8px rgba(255, 107, 129, 0.15) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #ff6b81 !important;
  box-shadow: 0 0 0 4px rgba(255, 107, 129, 0.15) !important;
}

:deep(.el-input__inner) {
  font-size: 1rem;
  color: #495057;
}

/* 移动端适配 */
@media (max-width: 768px) {
  :deep(.el-input__inner) {
    font-size: 16px;
  }
}

/* 图片上传区域样式 */
.image-upload-container {
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.image-upload-container:hover {
  border-color: #ff6b81;
  background: #fff;
}

.image-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid #ff6b81;
  color: #ff6b81;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.image-upload-btn:hover {
  background: #ff6b81;
  color: white;
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 1.2rem;
}

/* 图片预览网格样式 */
.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  color: #ff4757;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-image:hover {
  background: #ff4757;
  color: white;
}

.hidden-input {
  display: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .image-preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.8rem;
  }
  
  .image-upload-btn {
    width: 100%;
    justify-content: center;
  }
}

/* 添加新样式 */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.memory-card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.memory-card.lazy-load {
  opacity: 0;
  transform: translateY(20px);
}

.memory-card.lazy-loaded {
  opacity: 1;
  transform: translateY(0);
}

/* 优化图片加载过渡效果 */
.image-container img {
  transition: opacity 0.3s ease;
}

.image-container img[lazy="loading"] {
  opacity: 0;
}

.image-container img[lazy="loaded"] {
  opacity: 1;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .memory-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
  
  .memory-card {
    height: 200px;
  }
}

/* 更新查看器内容样式 */
.viewer-content {
  /* ... existing code ... */
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

.viewer-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.viewer-info {
  padding: 1rem;
}

/* 优化描述文本显示 */
.memory-description {
  max-height: 30vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  line-height: 1.6;
  margin: 0.5rem 0;
  touch-action: pan-y;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .viewer-content {
    display: flex;
    flex-direction: column;
  }
  
  .viewer-header {
    position: relative;
    padding-right: 3rem; /* 为闭按钮留出空间 */
  }
  
  .close-btn {
    position: fixed; /* 改为固定位 */
    top: 0.5rem;
    right: 0.5rem;
    z-index: 1010;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .viewer-info {
    padding: 1rem;
    background: white;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  }

  .memory-description {
    max-height: 20vh; /* 移动端降低描述区域高度 */
    font-size: 0.9rem;
  }

  .info-section {
    margin-bottom: 1rem;
  }

  .info-section h4 {
    margin: 0.5rem 0;
    font-size: 1rem;
  }

  /* 优化缩略图区域 */
  .thumbnail-grid {
    margin: 0.5rem -1rem;
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    white-space: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    gap: 0.5rem;
  }
}

/* 添加滚动条样式 */
.memory-description::-webkit-scrollbar {
  width: 4px;
}

.memory-description::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.memory-description::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

/* 添加渐变遮罩提示可滚动 */
.memory-description {
  position: relative;
}

.memory-description::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(transparent, #f8f9fa);
  pointer-events: none;
  opacity: 0.8;
}

/* 更新无更多数据提示的样式 */
.no-more {
  text-align: center;
  padding: 2rem 0;
  color: #999;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem auto;
  max-width: 200px;
}

.no-more::before,
.no-more::after {
  content: '';
  height: 1px;
  flex: 1;
  background: linear-gradient(to right, transparent, #ddd, transparent);
}

/* 或者使用更可爱的样式版本 */
.no-more {
  text-align: center;
  padding: 1.5rem 0;
  color: #ff6b81;  /* 使用主题色 */
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem auto;
  max-width: 280px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.no-more::before,
.no-more::after {
  content: '✨';  /* 使用表情符号装饰 */
  font-size: 1rem;
  color: #ffa5b1;
}

/* ... 其他样式 ... */
</style> 