// server/user-courses.js
const express = require('express');
const db = require('./db');
const router = express.Router();

// Добавление курса пользователю (есть уже)
router.post('/', (req, res) => {
  const { user_id, course_id } = req.body;
  if (!user_id || !course_id)
    return res.status(400).json({ success: false, error: 'user_id и course_id обязательны' });

  db.run(
    `INSERT OR IGNORE INTO user_courses (user_id, course_id) VALUES (?, ?)`,
    [user_id, course_id],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: 'Ошибка создания' });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Обновление прогресса
router.patch('/progress', (req, res) => {
  const { user_id, course_id, progress, status } = req.body;
  db.run(
    `UPDATE user_courses SET progress = ?, status = ?, started_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?`,
    [progress, status || 'in-progress', user_id, course_id],
    function (err) {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});


// --- ВАЖНО: Получение курсов пользователя ---
router.get('/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.all(`
    SELECT uc.*, c.title, c.image, c.time, c.difficulty
    FROM user_courses uc
    JOIN courses c ON c.id = uc.course_id
    WHERE uc.user_id = ?
    ORDER BY uc.updated_at DESC
  `, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'Ошибка получения курсов пользователя' });
    res.json(rows);
  });
});

module.exports = router;
