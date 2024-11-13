const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const multer = require('multer');
const Memory = require('./models/Memory');
const path = require('path');

// 中间件
app.use(cors())
app.use(express.json())

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/loveMessages', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// 消息模型
const Message = mongoose.model('Message', {
    visitorName: String,
    content: String,
    mood: String,
    time: Date
  })

// 配置图片上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/memories/') // 存储回忆图片的目录
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只能上传图片文件'))
    }
  }
});

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

app.post('/api/memories/upload', upload.array('images', 10), (req, res) => {
  try {
    const imageUrls = req.files.map(file => `/uploads/memories/${file.filename}`);
    res.json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: '图片上传失败' });
  }
});

app.post('/api/memories', async (req, res) => {
  try {
    const memory = new Memory(req.body);
    await memory.save();
    res.json(memory);
  } catch (error) {
    res.status(500).json({ error: '保存回忆失败' });
  }
});

app.get('/api/memories', async (req, res) => {
  try {
    const memories = await Memory.find().sort({ date: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: '获取回忆列表失败' });
  }
});

app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000')
}) 