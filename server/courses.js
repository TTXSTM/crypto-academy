const express = require('express');
const router = express.Router();
const db = require('./db'); // Подключение к БД
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads', 'courses'); // server/uploads/courses
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// СОЗДАНИЕ КУРСА
// СОЗДАНИЕ КУРСА
router.post('/', upload.fields([{ name: 'image' }, { name: 'background' }]), async (req, res) => {
  const { title, time, difficulty, content, chapters } = req.body;

  const imagePath = req.files.image?.[0]?.filename ? `/uploads/courses/${req.files.image[0].filename}` : '';
  const backgroundPath = req.files.background?.[0]?.filename ? `/uploads/courses/${req.files.background[0].filename}` : '';

  let parsedChapters = [];
  if (chapters) {
    try {
      parsedChapters = typeof chapters === 'string' ? JSON.parse(chapters) : chapters;
    } catch (e) {
      parsedChapters = [];
    }
  }

  db.run(
    `INSERT INTO courses (title, time, difficulty, content, image, background) VALUES (?, ?, ?, ?, ?, ?)`,
    [title, time, difficulty, content, imagePath, backgroundPath],
    async function (err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при добавлении курса' });
      }
      const courseId = this.lastID;

      if (parsedChapters && parsedChapters.length > 0) {
        try {
          const insertChapter = db.prepare('INSERT INTO chapters (course_id, title, content) VALUES (?, ?, ?)');
          const insertQuiz = db.prepare('INSERT INTO quizzes (chapter_id, question, options, correct) VALUES (?, ?, ?, ?)');

          for (const chapter of parsedChapters) {
            // 1. Сохраняем главу
            const chapterId = await new Promise((resolve, reject) => {
              insertChapter.run(
                courseId,
                chapter.title || '',
                chapter.content || '',
                function (err) {
                  if (err) reject(err);
                  else resolve(this.lastID);
                }
              );
            });

            // 2. Сохраняем квизы этой главы
            if (Array.isArray(chapter.quiz) && chapter.quiz.length > 0) {
              for (const quiz of chapter.quiz) {
                await new Promise((resolve, reject) => {
                  insertQuiz.run(
                    chapterId,
                    quiz.question || '',
                    JSON.stringify(quiz.options || []),
                    JSON.stringify(quiz.correct || []),
                    (err) => { if (err) reject(err); else resolve(); }
                  );
                });
              }
            }
          }

          insertChapter.finalize();
          insertQuiz.finalize();
        } catch (err) {
          return res.status(500).json({ error: 'Ошибка при добавлении глав или квизов' });
        }
      }
      res.status(201).json({ id: courseId, message: 'Курс добавлен' });
    }
  );
});


// ВСЕ КУРСЫ
router.get('/', (req, res) => {
  db.all('SELECT * FROM courses ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка при получении курсов' });
    res.json(rows);
  });
});

// Получение одного курса по id (+ главы!)
router.get('/:id', (req, res) => {
  const courseId = req.params.id;
  db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, course) => {
    if (err) return res.status(500).json({ error: 'Ошибка при получении курса' });
    if (!course) return res.status(404).json({ error: 'Курс не найден' });

    db.all('SELECT * FROM chapters WHERE course_id = ?', [courseId], (err, chapters) => {
      if (err) return res.status(500).json({ error: 'Ошибка при получении глав' });

      // Теперь достаём квизы для каждой главы
      const chaptersWithQuizzes = [];
      let completed = 0;

      if (chapters.length === 0) {
        course.chapters = [];
        return res.json(course);
      }

      chapters.forEach((chapter, idx) => {
        db.all('SELECT * FROM quizzes WHERE chapter_id = ?', [chapter.id], (err, quizzes) => {
          // Парсим options и correct обратно в массивы
          if (quizzes && quizzes.length > 0) {
            quizzes = quizzes.map(q => ({
              ...q,
              options: JSON.parse(q.options || '[]'),
              correct: JSON.parse(q.correct || '[]')
            }));
          }
          chaptersWithQuizzes[idx] = {
            ...chapter,
            quiz: quizzes || []
          };
          completed++;
          if (completed === chapters.length) {
            course.chapters = chaptersWithQuizzes;
            res.json(course);
          }
        });
      });
    });
  });
});


// УДАЛЕНИЕ КУРСА
router.delete('/:id', (req, res) => {
  const courseId = req.params.id;
  db.run('DELETE FROM courses WHERE id = ?', [courseId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при удалении курса' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Курс не найден' });
    }
    res.sendStatus(200);
  });
});

module.exports = router;
