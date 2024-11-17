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

    <!-- 回忆列表 -->
    <div class="memory-grid">
      <div v-for="memory in memories" 
           :key="memory._id" 
           class="memory-card"
           @click="showMemory(memory)">
        <div class="image-container">
          <img :src="memory.images[0]" 
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
              <img :src="selectedMemory.images[currentImageIndex]" 
                   :alt="selectedMemory.title">
              
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
                <h4>关于这个回忆</h4>
                <p class="memory-description">{{ selectedMemory.description || '暂无描述' }}</p>
              </div>

              <div class="info-section">
                <h4>照片集 ({{ selectedMemory.images.length }})</h4>
                <div class="thumbnail-grid">
                  <div v-for="(image, index) in selectedMemory.images"
                       :key="index"
                       class="thumbnail"
                       :class="{ active: index === currentImageIndex }"
                       @click="currentImageIndex = index">
                    <img :src="image" :alt="`照片 ${index + 1}`">
                  </div>
                </div>
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
import BackButton from '../components/BackButton.vue'
import 'element-plus/dist/index.css'
import { ElDatePicker } from 'element-plus'

const API_URL = 'http://110.42.197.57:3000/api'
const memories = ref([])
const showCreateModal = ref(false)
const error = ref('')

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
}

const closeViewer = () => {
  selectedMemory.value = null
  currentImageIndex.value = 0
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
  fetchMemories()
})

// 日期选择器配置
const size = ref('large')

// ... 其他代码 ...
</script>

<style scoped>
.memory {
  padding: 2rem;
  min-height: 100vh;
  background: #f5f5f5;
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
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  min-height: 400px;
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
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  background: #f5f5f5;
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
  }

  .main-image {
    width: 100%;
    height: 50vh;
  }

  .viewer-info {
    width: 100%;
  }
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

/* ... 其他样式 ... */
</style> 