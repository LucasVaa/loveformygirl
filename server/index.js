const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const multer = require('multer');
const Memory = require('./models/Memory');
const path = require('path');
const fs = require('fs');

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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).array('images', 10);

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
  upload(req, res, async function(err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: '没有上传文件' });
      }

      // 直接保存图片到数据库
      const images = await Promise.all(req.files.map(async (file) => {
        const image = {
          data: file.buffer,
          contentType: file.mimetype,
          _id: new mongoose.Types.ObjectId()
        };
        return image;
      }));

      // 存储临时图片数据
      req.app.locals.tempImages = req.app.locals.tempImages || {};
      images.forEach(img => {
        req.app.locals.tempImages[img._id.toString()] = img;
      });

      // 返回图片URL
      const imageUrls = images.map(img => 
        `http://localhost:3000/api/images/${img._id}`
      );

      res.json({ 
        imageUrls,
        imageIds: images.map(img => img._id.toString())
      });
    } catch (error) {
      console.error('Upload error:', error);
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

    // 返回带有图片URL的数据
    const memoryData = memory.toObject();
    memoryData.images = memory.images.map(img => 
      `http://localhost:3000/api/images/${img._id}`
    );

    res.json(memoryData);
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: '保存失败' });
  }
});

app.get('/api/memories', async (req, res) => {
  try {
    const memories = await Memory.find().sort('-date');
    
    // 转换图片URL
    const memoriesWithUrls = memories.map(memory => {
      const memoryData = memory.toObject();
      memoryData.images = memory.images.map(img => 
        `http://localhost:3000/api/images/${img._id}`
      );
      return memoryData;
    });

    res.json(memoriesWithUrls);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: '获取回忆失败' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 