<template>
  <div class="memory">
    <BackButton />
    <div class="memory-content">
      <div class="header-actions">
        <h2 class="memory-title">美好回忆</h2>
        <button class="add-btn" @click="showCreateModal = true">
          创建新回忆 ✨
        </button>
      </div>

      <div class="memory-grid">
        <div v-for="memory in memories" 
             :key="memory._id" 
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

    <div v-if="showCreateModal" 
         class="create-modal"
         @click.self="closeCreateModal">
      <div class="modal-content">
        <h3>创建新回忆</h3>
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <form @submit.prevent="saveMemory" class="create-form">
          <div class="form-group">
            <label>标题</label>
            <input 
              v-model="newMemory.title" 
              required
              placeholder="给这个回忆起个名字">
          </div>

          <div class="form-group">
            <label>日期</label>
            <input 
              type="date" 
              v-model="newMemory.date" 
              required>
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="newMemory.description" 
              rows="4" 
              required
              placeholder="记录下这个美好时刻..."></textarea>
          </div>

          <div class="form-group">
            <label>标签</label>
            <input 
              v-model="tagsInput" 
              placeholder="用逗号分隔多个标签，如：约会,旅行">
          </div>

          <div class="form-group">
            <label>上传图片</label>
            <input 
              type="file" 
              ref="fileInput"
              @change="handleImageUpload"
              accept="image/*"
              multiple
              class="file-input">
            
            <div class="image-preview-container">
              <div v-for="(file, index) in selectedFiles" 
                   :key="index" 
                   class="image-preview">
                <img :src="getPreviewUrl(file)" alt="预览">
                <button 
                  type="button"
                  class="remove-image"
                  @click="removeImage(index)">×</button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" 
                    @click="closeCreateModal"
                    class="cancel-btn">取消</button>
            <button type="submit" 
                    class="save-btn"
                    :disabled="!isFormValid">
              {{ saving ? '保存中...' : '保存回忆' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import BackButton from '../components/BackButton.vue'

const API_URL = 'http://localhost:3000/api'

const memories = ref([])
const showCreateModal = ref(false)
const error = ref('')
const saving = ref(false)
const tagsInput = ref('')
const selectedFiles = ref([])

const newMemory = ref({
  title: '',
  date: '',
  description: '',
  images: [],
  tags: []
})

const fetchMemories = async () => {
  try {
    const response = await axios.get(`${API_URL}/memories`)
    memories.value = response.data
  } catch (err) {
    console.error('获取回忆失败:', err)
  }
}

const showMemory = (memory) => {
  newMemory.value = memory
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newMemory.value = {
    title: '',
    date: '',
    description: '',
    images: []
  }
  selectedFiles.value = []
  tagsInput.value = ''
  error.value = ''
}

const handleImageUpload = (event) => {
  const files = event.target.files
  if (!files.length) return
  
  selectedFiles.value = [...selectedFiles.value, ...Array.from(files)]
}

const getPreviewUrl = (file) => {
  if (typeof file === 'string') {
    return file
  }
  return URL.createObjectURL(file)
}

const removeImage = (index) => {
  selectedFiles.value.splice(index, 1)
}

const isFormValid = computed(() => {
  return newMemory.value.title && 
         newMemory.value.date && 
         newMemory.value.description && 
         selectedFiles.value.length > 0
})

const saveMemory = async () => {
  if (!isFormValid.value) return
  
  saving.value = true
  error.value = ''
  
  try {
    const formData = new FormData()
    selectedFiles.value.forEach(file => {
      formData.append('images', file)
    })
    
    const { data: uploadResponse } = await axios.post(
      `${API_URL}/memories/upload`, 
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    
    const memoryData = {
      title: newMemory.value.title,
      date: newMemory.value.date,
      description: newMemory.value.description,
      tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean),
      imageIds: uploadResponse.imageIds
    }
    
    await axios.post(`${API_URL}/memories`, memoryData)
    await fetchMemories()
    closeCreateModal()
  } catch (err) {
    console.error('Save error:', err)
    error.value = '保存失败：' + (err.response?.data?.error || err.message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchMemories()
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

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.save-btn {
  background: #ff6b81;
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
}
</style> 