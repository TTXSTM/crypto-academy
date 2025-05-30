const express = require('express');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'materials');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ========================
// ТЕГИ
// ========================

// Получить все теги
router.get('/tags', (req, res) => {
  db.all('SELECT * FROM tags', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка при получении тегов' });
    res.json(rows);
  });
});

// Добавить тег (обработка дубликатов)
router.post('/tags', express.json(), (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Название тега обязательно' });

  db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [name], function (err) {
    if (err) {
      console.error('Ошибка при добавлении тега:', err);
      return res.status(500).json({ error: 'Ошибка при добавлении тега' });
    }
    if (this.changes === 0) {
      // Уже есть такой тег, возвращаем его
      db.get('SELECT * FROM tags WHERE name = ?', [name], (err, row) => {
        if (err || !row) return res.status(500).json({ error: 'Ошибка поиска тега' });
        return res.json(row);
      });
    } else {
      res.json({ id: this.lastID, name });
    }
  });
});

// ========================
// МАТЕРИАЛЫ
// ========================

// Получить все материалы
router.get('/', async (req, res) => {
  db.all('SELECT * FROM materials ORDER BY id DESC', async (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка при получении материалов' });
    // Получаем не просто id тегов, а массив объектов { id, name, color }
    for (const row of rows) {
      row.tags = await getMaterialTags(row.id);
    }
    res.json(rows);
  });
});

// Получить один материал
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM materials WHERE id = ?', [id], async (err, material) => {
    if (err) return res.status(500).json({ error: 'Ошибка при получении материала' });
    if (!material) return res.status(404).json({ error: 'Материал не найден' });
    material.tags = await getMaterialTags(material.id);
    res.json(material);
  });
});

// Создать материал
router.post('/', upload.single('image'), (req, res) => {
  console.log('📥 Запрос на создание материала получен');
  const { title, time, section, difficulty, content, description } = req.body;
  console.log('➡️ Данные из формы:', { title, time, section, difficulty, content });

  let tags = [];
  try {
    tags = JSON.parse(req.body.tags || '[]');
    console.log('✅ Теги распарсены:', tags);
  } catch (err) {
    console.error('❌ Ошибка при разборе тегов:', err);
    return res.status(400).json({ error: 'Неверный формат тегов' });
  }

  const image = req.file ? `/uploads/materials/${req.file.filename}` : '';
  console.log('🖼️ Картинка:', image);

  db.run(
  `INSERT INTO materials (title, time, section, difficulty, content, description, image)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [title, time, section, difficulty, content, description, image],
    function (err) {
      if (err) {
        console.error('❌ Ошибка при вставке материала в базу:', err);
        return res.status(500).json({ error: 'Ошибка при добавлении материала в БД' });
      }
      const materialId = this.lastID;
      console.log('✅ Материал добавлен, ID:', materialId);

      saveMaterialTags(materialId, tags, () => {
        console.log('✅ Теги сохранены');
        res.status(201).json({ id: materialId, message: 'Материал добавлен' });
      });
    }
  );
});

// Обновить материал
router.put('/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;
  const { title, time, section, difficulty, content, description } = req.body;
  let tags = [];
  try { tags = JSON.parse(req.body.tags || '[]'); } catch {}
  let image = null;
  if (req.file) image = `/uploads/materials/${req.file.filename}`;

  const updateMaterial = () => {
    saveMaterialTags(id, tags, () => {
      res.json({ id, message: 'Материал обновлён' });
    });
  };

  if (image) {
    db.run(
      `UPDATE materials SET title=?, time=?, section=?, difficulty=?, content=?, description=?, image=? WHERE id=?`,
      [title, time, section, difficulty, content, description, image, id],
      err => {
        if (err) return res.status(500).json({ error: 'Ошибка при обновлении материала' });
        updateMaterial();
      }
    );
  } else {
    db.run(
      `UPDATE materials SET title=?, time=?, section=?, difficulty=?, content=?, description=? WHERE id=?`,
      [title, time, section, difficulty, content, description, id],
      err => {
        if (err) return res.status(500).json({ error: 'Ошибка при обновлении материала' });
        updateMaterial();
      }
    );
  }
});

// Удалить материал
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM materials WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Ошибка при удалении материала' });
    db.run('DELETE FROM material_tags WHERE material_id = ?', [id], () => {
      res.sendStatus(200);
    });
  });
});

// ========================
// ВСПОМОГАТЕЛЬНЫЕ
// ========================

function saveMaterialTags(materialId, tagIds, cb) {
  db.run('DELETE FROM material_tags WHERE material_id = ?', [materialId], () => {
    if (tagIds.length === 0) return cb();
    let done = 0;
    tagIds.forEach(tagId => {
      db.run(
        `INSERT OR IGNORE INTO material_tags (material_id, tag_id) VALUES (?, ?)`,
        [materialId, tagId],
        () => {
          done++;
          if (done === tagIds.length) cb();
        }
      );
    });
  });
}

function getMaterialTags(materialId) {
  return new Promise(resolve => {
    db.all(
      `SELECT tags.id, tags.name, tags.color
       FROM material_tags
       JOIN tags ON material_tags.tag_id = tags.id
       WHERE material_tags.material_id = ?`,
      [materialId],
      (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      }
    );
  });
}

router.get('/', (req, res) => {
  db.all('SELECT * FROM materials ORDER BY id DESC', async (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка при получении материалов' });
    for (const row of rows) {
      row.tags = await getMaterialTags(row.id); // Теперь массив объектов тегов!
    }
    res.json(rows);
  });
});



module.exports = router;
