const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const courseRoutes = require('./courses');
const materialRoutes = require('./materials'); // Подключаем новый роутер
const authRoutes = require('./auth');
const userCoursesRoutes = require('./user-courses');


const app = express();
const PORT = 3001;

// CORS и парсер JSON
app.use(cors());
app.use(express.json());

// Статические папки для изображений курсов и материалов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршруты API
app.use('/api/courses', courseRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api', authRoutes);
app.use('/api/user-courses', userCoursesRoutes);

// Получение файла картинки для курсов (на случай ручного запроса)
app.get('/uploads/courses/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', 'courses', filename);
  fs.exists(filePath, (exists) => {
    if (exists) {
      res.sendFile(filePath);
    } else {
      res.status(404).send({ error: 'Файл не найден' });
    }
  });
});

// Получение файла картинки для материалов
app.get('/uploads/materials/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', 'materials', filename);
  fs.exists(filePath, (exists) => {
    if (exists) {
      res.sendFile(filePath);
    } else {
      res.status(404).send({ error: 'Файл не найден' });
    }
  });
});

// Старт сервера
app.listen(3001, '0.0.0.0', () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
