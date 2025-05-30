// server/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const router = express.Router();

// Регистрация пользователя
router.post('/register', async (req, res) => {
  const { email, phone, password, nickname } = req.body;

  if ((!email && !phone) || !password || !nickname) {
    return res.status(400).json({ error: 'Все поля обязательны', success: false });
  }

  // Проверяем, существует ли пользователь с таким email или телефоном
  db.get(
    'SELECT * FROM users WHERE email = ? OR phone = ?',
    [email || null, phone || null],
    async (err, user) => {
      if (err) return res.status(500).json({ error: 'Ошибка сервера', success: false });
      if (user) {
        return res.json({ error: 'Пользователь уже существует', success: false });
      }
      const password_hash = await bcrypt.hash(password, 10);

      db.run(
        'INSERT INTO users (email, phone, password_hash, nickname) VALUES (?, ?, ?, ?)',
        [email || null, phone || null, password_hash, nickname],
        function (err) {
          if (err) return res.status(500).json({ error: 'Ошибка регистрации', success: false });

          // Вернём только что созданного пользователя
          db.get(
            'SELECT id, email, phone, nickname, created_at FROM users WHERE id = ?',
            [this.lastID],
            (err, userData) => {
              if (err || !userData) {
                return res.status(500).json({ error: 'Ошибка получения пользователя', success: false });
              }
              res.json({ success: true, user: userData });
            }
          );
        }
      );
    }
  );
});

// Вход пользователя
router.post('/login', (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'Все поля обязательны', success: false });
  }

  db.get(
    'SELECT * FROM users WHERE email = ? OR phone = ?',
    [emailOrPhone, emailOrPhone],
    async (err, user) => {
      if (err) return res.status(500).json({ error: 'Ошибка сервера', success: false });
      if (!user) {
        return res.json({ error: 'Пользователь не найден', success: false });
      }
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.json({ error: 'Неверный пароль', success: false });
      }
      res.json({
        success: true,
        user: { id: user.id, email: user.email, phone: user.phone, nickname: user.nickname }
      });
    }
  );
});

router.get('/user-courses/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(
    "SELECT * FROM user_courses WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Ошибка сервера" });
      // Можно сразу джойнить с курсами, если нужно подробное описание
      res.json({ courses: rows || [] });
    }
  );
});

// Обновление профиля пользователя
router.patch('/users/:id', async (req, res) => {
  const { nickname, email, phone, password } = req.body;
  const { id } = req.params;

  if (!nickname || !email) return res.status(400).json({ success: false, error: "Все поля обязательны" });

  let sql, params;
  if (password) {
    const password_hash = await bcrypt.hash(password, 10);
    sql = `UPDATE users SET nickname=?, email=?, phone=?, password_hash=? WHERE id=?`;
    params = [nickname, email, phone, password_hash, id];
  } else {
    sql = `UPDATE users SET nickname=?, email=?, phone=? WHERE id=?`;
    params = [nickname, email, phone, id];
  }

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ success: false, error: "Ошибка обновления профиля" });
    db.get(`SELECT id, nickname, email, phone FROM users WHERE id=?`, [id], (err, user) => {
      if (err) return res.status(500).json({ success: false, error: "Ошибка" });
      res.json({ success: true, user });
    });
  });
});

module.exports = router;
