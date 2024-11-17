const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const multer = require('multer')
const Memory = require('./models/Memory')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const NodeCache = require('node-cache')

const API_URL = process.env.API_URL || 'http://110.42.197.57:3000'

// 中间件
app.use(cors())
app.use(express.json())

// 连接MongoDB
mongoose.connect('mongodb://110.42.197.57:27017/loveMessages', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
  authSource: 'admin'
})

// 消息模型
const Message = mongoose.model('Message', {
    visitorName: String,
    content: String,
    mood: String,
    time: Date
  })

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置静态文件访问
app.use('/uploads', express.static(uploadDir))

// 创建缓存实例
const imageCache = new NodeCache({ 
  stdTTL: 600, // 缓存10分钟
  checkperiod: 120 
})

// 修改存储配置，改用磁盘存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只能上传图片文件'))
    }
  }
}).array('images', 10)

// API路由
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ time: -1 })
    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: '获取消息失败' })
  }
})

app.post('/api/messages', async (req, res) => {
  try {
    const message = new Message(req.body)
    await message.save()
    res.json(message)
  } catch (error) {
    res.status(500).json({ error: '保存消息失败' })
  }
})

// 图片处理和上传
app.post('/api/memories/upload', async (req, res) => {
  upload(req, res, async function(err) {
    if (err) {
      console.error('Upload error:', err)
      return res.status(400).json({ error: err.message })
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: '没有上传文件' })
      }

      const processedImages = await Promise.all(req.files.map(async file => {
        // 生成缩略图
        const thumbnail = await sharp(file.path)
          .resize(800, 800, { // 限制最大尺寸
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 }) // 压缩质量
          .toBuffer()

        const imageId = new mongoose.Types.ObjectId()
        const thumbnailPath = path.join(uploadDir, `thumb_${imageId}.jpg`)
        
        // 保存缩略图
        await sharp(thumbnail).toFile(thumbnailPath)

        return {
          _id: imageId,
          originalPath: file.path,
          thumbnailPath,
          contentType: 'image/jpeg'
        }
      }))

      // 存储图片信息
      req.app.locals.tempImages = req.app.locals.tempImages || {}
      processedImages.forEach(img => {
        req.app.locals.tempImages[img._id.toString()] = img
      })

      res.json({ 
        imageUrls: processedImages.map(img => `/api/images/${img._id}`),
        imageIds: processedImages.map(img => img._id.toString())
      })
    } catch (error) {
      console.error('Image processing error:', error)
      res.status(500).json({ error: '图片处理失败' })
    }
  })
})

// 优化图片获取接口
app.get('/api/images/:id', async (req, res) => {
  try {
    const id = req.params.id
    const size = req.query.size || 'thumb' // 支持获取原图或缩略图
    
    // 检查缓存
    const cacheKey = `${id}_${size}`
    const cachedImage = imageCache.get(cacheKey)
    if (cachedImage) {
      res.set('Content-Type', 'image/jpeg')
      return res.send(cachedImage)
    }

    // 从临时存储或数据库获取
    let imagePath
    const tempImage = req.app.locals.tempImages?.[id]
    if (tempImage) {
      imagePath = size === 'original' ? tempImage.originalPath : tempImage.thumbnailPath
    } else {
      const memory = await Memory.findOne({ 'images._id': id })
      if (!memory) return res.status(404).send('Image not found')
      
      const image = memory.images.find(img => img._id.toString() === id)
      if (!image) return res.status(404).send('Image not found')
      
      imagePath = size === 'original' ? image.originalPath : image.thumbnailPath
    }

    // 读取并缓存图片
    const imageBuffer = await fs.promises.readFile(imagePath)
    imageCache.set(cacheKey, imageBuffer)

    res.set('Content-Type', 'image/jpeg')
    res.send(imageBuffer)
  } catch (error) {
    console.error('Get image error:', error)
    res.status(500).send('Server error')
  }
})

// 优化回忆保存接口
app.post('/api/memories', async (req, res) => {
  try {
    const { title, date, description, tags, imageIds } = req.body
    
    const images = imageIds.map(id => {
      const tempImage = req.app.locals.tempImages[id]
      if (!tempImage) return null
      
      return {
        _id: tempImage._id,
        originalPath: tempImage.originalPath,
        thumbnailPath: tempImage.thumbnailPath,
        contentType: tempImage.contentType
      }
    }).filter(Boolean)

    if (images.length === 0) {
      return res.status(400).json({ error: '没有有效的图片' })
    }

    const memory = new Memory({
      title,
      date,
      description,
      tags: tags || [],
      images
    })

    await memory.save()
    imageIds.forEach(id => delete req.app.locals.tempImages[id])

    const memoryData = memory.toObject()
    memoryData.images = memory.images.map(img => 
      `${API_URL}/api/images/${img._id}`
    )

    res.json(memoryData)
  } catch (error) {
    console.error('Save memory error:', error)
    res.status(500).json({ error: '保存回忆失败' })
  }
})

// 优化回忆列表接口
app.get('/api/memories', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    
    const memories = await Memory.find()
      .select('title date description tags images._id') // 只选择需要的字段
      .sort('-date')
      .skip((page - 1) * limit)
      .limit(limit)
    
    const memoriesWithUrls = memories.map(memory => ({
      _id: memory._id,
      title: memory.title,
      date: memory.date,
      description: memory.description,
      tags: memory.tags,
      images: memory.images.map(img => `${API_URL}/api/images/${img._id}`)
    }))

    res.json(memoriesWithUrls)
  } catch (error) {
    console.error('Fetch memories error:', error)
    res.status(500).json({ error: '获取回忆列表失败' })
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 