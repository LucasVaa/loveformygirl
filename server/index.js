const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const multer = require('multer');
const Memory = require('./models/Memory');
const path = require('path');
const fs = require('fs');

const API_URL = process.env.API_URL || 'http://110.42.197.57:3000';

// 中间件
app.use(cors())
app.use(express.json())

// 连接MongoDB
mongoose.connect('mongodb://110.42.197.57:27017/loveMessages', {
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

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置静态文件访问
app.use('/uploads', express.static(uploadDir));

// 配置图片上传
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传图片文件'));
    }
  }
}).array('images', 10); // 允许最多10张图片

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

app.post('/api/memories/upload', (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: '没有上传文件' });
      }

      const images = req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
        _id: new mongoose.Types.ObjectId()
      }));

      // 存储临时图片数据
      req.app.locals.tempImages = req.app.locals.tempImages || {};
      images.forEach(img => {
        req.app.locals.tempImages[img._id.toString()] = img;
      });

      res.json({ 
        imageUrls: images.map(img => `/api/images/${img._id}`),
        imageIds: images.map(img => img._id.toString())
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: '上传失败' });
    }
  });
});

app.get('/api/images/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // 先检查临时存储
    const tempImage = req.app.locals.tempImages?.[id];
    if (tempImage) {
      res.set('Content-Type', tempImage.contentType);
      return res.send(tempImage.data);
    }

    // 从数据库查找
    const memory = await Memory.findOne({
      'images._id': id
    });

    if (!memory) {
      console.log('Image not found:', id);
      return res.status(404).send('Image not found');
    }

    const image = memory.images.find(img => 
      img._id.toString() === id
    );

    if (!image) {
      console.log('Image not found in memory:', id);
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).send('Server error');
  }
});

app.post('/api/memories', async (req, res) => {
  try {
    const { title, date, description, tags, imageIds } = req.body;
    
    // 获取临时存储的图片
    const images = imageIds.map(id => req.app.locals.tempImages[id])
                         .filter(Boolean);

    if (images.length === 0) {
      return res.status(400).json({ error: '没有有效的图片' });
    }

    const memory = new Memory({
      title,
      date,
      description,
      tags: tags || [],
      images
    });

    await memory.save();

    // 清理临时存储
    imageIds.forEach(id => delete req.app.locals.tempImages[id]);

    // 返回格式化后的数据
    const memoryData = memory.toObject();
    memoryData.images = memory.images.map(img => 
      `${API_URL}/api/images/${img._id}`
    );

    res.json(memoryData);
  } catch (error) {
    console.error('Save memory error:', error);
    res.status(500).json({ error: '保存回忆失败' });
  }
});

app.get('/api/memories', async (req, res) => {
  try {
    const memories = await Memory.find().sort('-date');
    
    // 转换图片URL和格式化数据
    const memoriesWithUrls = memories.map(memory => {
      const memoryData = memory.toObject();
      memoryData.images = memory.images.map(img => 
        `${API_URL}/api/images/${img._id}`
      );
      return {
        _id: memoryData._id,
        title: memoryData.title,
        date: memoryData.date,
        description: memoryData.description,
        tags: memoryData.tags,
        images: memoryData.images,
        createdAt: memoryData.createdAt
      };
    });

    console.log('Sending memories:', memoriesWithUrls); // 调试用
    res.json(memoriesWithUrls);
  } catch (error) {
    console.error('Fetch memories error:', error);
    res.status(500).json({ error: '获取回忆列表失败' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 