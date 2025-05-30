const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('✅ Подключено к SQLite базе данных.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      time TEXT,
      difficulty TEXT,
      content TEXT,
      image TEXT,
      background TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      title TEXT,
      content TEXT,
      FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER,
      question TEXT,
      options TEXT,
      correct TEXT,
      FOREIGN KEY(chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      time TEXT,
      section TEXT,
      difficulty TEXT,
      content TEXT,
      description TEXT,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS material_tags (
      material_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (material_id, tag_id),
      FOREIGN KEY(material_id) REFERENCES materials(id) ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      phone TEXT,
      password_hash TEXT,
      nickname TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS user_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      status TEXT DEFAULT 'in-progress',
      progress INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id)
    )
  `);

  // Миграция: добавь progress, если нет
db.all("PRAGMA table_info(user_courses)", (err, columns) => {
  if (err) return;
  const colNames = columns.map(col => col.name);
  if (!colNames.includes('progress')) {
    db.run(`ALTER TABLE user_courses ADD COLUMN progress INTEGER DEFAULT 0`, () => console.log('✅ user_courses.progress добавлен'));
  }
  if (!colNames.includes('status')) {
    db.run(`ALTER TABLE user_courses ADD COLUMN status TEXT DEFAULT 'in-progress'`, () => console.log('✅ user_courses.status добавлен'));
  }
  if (!colNames.includes('updated_at')) {
    db.run(`ALTER TABLE user_courses ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, () => console.log('✅ user_courses.updated_at добавлен'));
  }
});
});

module.exports = db;
