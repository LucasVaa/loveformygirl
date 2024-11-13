<template>
  <div class="letter-container">
    <BackButton />
    <div class="letter-paper">
      <div class="letter-content">
        <div class="date">{{ currentDate }}</div>
        <div class="dear">亲爱的{{ girlName }}：</div>
        <div class="letter-text">
          <span class="typed-text">{{ displayText }}</span>
          <span class="cursor" :class="{ 'typing': isTyping }">|</span>
        </div>
        <div class="signature" v-show="showSignature">
          爱你的{{ boyName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BackButton from '../components/BackButton.vue'

const girlName = ref('宝贝') // 替换成女友的名字
const boyName = ref('你的名字') // 替换成你的名字

// 信的内容
const letter = `还记得我们第一次相遇的场景吗？那天的阳光正好，照在你的脸上，让我一瞬间就心动了。

从那以后，我的生活就被你的笑容填满了。每一个有你的日子都变得格外明亮，就像被施了魔法一样。

谢谢你让我懂得了爱情的美好，谢谢你包容我的任性，谢谢你一直在我身边。

我想告诉你，你就是我最重要的人，我会一直珍惜你，爱护你，陪伴你。

希望未来的每一天，我们都能一起看日出日落，一起数星星看月亮，一起经历生活的点点滴滴。`

const displayText = ref('')
const isTyping = ref(true)
const showSignature = ref(false)

// 获取当前日期
const currentDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

// 打字机效果
const typeText = async () => {
  const text = letter
  for (let i = 0; i < text.length; i++) {
    displayText.value += text[i]
    // 如果是换行符，稍微多等一下
    await new Promise(resolve => 
      setTimeout(resolve, text[i] === '\n' ? 800 : 100)
    )
  }
  isTyping.value = false
  showSignature.value = true
}

onMounted(() => {
  typeText()
})
</script>

<style scoped>
.letter-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #ffe6e6 0%, #f5f5f5 100%);
}

.letter-paper {
  max-width: 800px;
  width: 90%;
  background: white;
  padding: 3rem;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  background-image: linear-gradient(#f5f5f5 1px, transparent 1px);
  background-size: 100% 2rem;
}

.letter-content {
  line-height: 2;
  color: #333;
}

.date {
  text-align: right;
  color: #666;
  margin-bottom: 2rem;
}

.dear {
  margin-bottom: 2rem;
  color: #ff6b81;
  font-size: 1.2rem;
}

.letter-text {
  white-space: pre-wrap;
  min-height: 300px;
}

.signature {
  text-align: right;
  margin-top: 3rem;
  color: #ff6b81;
  font-size: 1.2rem;
}

.cursor {
  display: inline-block;
  width: 3px;
  margin-left: 2px;
  animation: blink 1s infinite;
}

.cursor.typing {
  animation: none;
  opacity: 1;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .letter-paper {
    padding: 2rem;
  }
  
  .letter-content {
    font-size: 0.9rem;
  }
}

/* 添加一些装饰 */
.letter-paper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, #ff6b81, #ffa5b1);
  border-radius: 10px 10px 0 0;
}
</style> 