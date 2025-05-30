import React, { useState, useEffect } from 'react';
import Editor from '../components/Editor';

const Admin = () => {
  const [mode, setMode] = useState('article');
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tags, setTags] = useState([]); // ← должно быть массивом
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState(null);
  const [time, setTime] = useState('');
  const [section, setSection] = useState('Последние материалы');
  const [difficulty, setDifficulty] = useState('');
  const [image, setImage] = useState(null);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [courseChapters, setCourseChapters] = useState([
    { title: '', content: '', quiz: [{ question: '', options: ['', '', '', ''], correct: [] }] }
  ]);

  // --- Теги ---

  // Получить все теги
  const fetchTags = () => {
  fetch('http://localhost:3001/api/materials/tags')
    .then(res => res.ok ? res.json() : Promise.reject('Ошибка'))
    .then(data => {
      if (Array.isArray(data)) {
        setTags(data);
      } else {
        setTags([]);
      }
    })
    .catch(() => setTags([]));
};


  // Добавить тег
  const handleAddTag = (e) => {
    e.preventDefault();
    const tagName = newTag.trim();
    if (!tagName) return;
    fetch('http://localhost:3001/api/materials/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tagName }),
    })
      .then(res => res.json())
      .then(tag => {
        console.log('Добавлен тег:', tag);
        setTags(prev => [...prev, tag]);
        setNewTag('');
      });
  };

  // Обработка выбора тегов (чекбоксы)
  const handleToggleTag = (id) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  // --- Materials & Courses ---
  useEffect(() => {
    fetch('http://localhost:3001/api/courses').then(res => res.json()).then(setCourses);
    fetch('http://localhost:3001/api/materials').then(res => res.json()).then(setMaterials);
    fetchTags();
  }, []);

  const handleDeleteCourse = (id) => {
    if (!window.confirm('Удалить курс?')) return;
    fetch(`http://localhost:3001/api/courses/${id}`, { method: 'DELETE' })
      .then(() => setCourses(prev => prev.filter(c => c.id !== id)));
  };

  const handleEditCourse = (course) => {
    fetch(`http://localhost:3001/api/courses/${course.id}`)
      .then(res => res.json())
      .then(data => {
        setEditingId(course.id);
        setTitle(data.title);
        setTime(data.time);
        setDifficulty(data.difficulty);
        setContent(data.content);
        setCurrentImageUrl(`http://localhost:3001${data.image}`);
        setCourseChapters(data.chapters || []);
      });
  };

  const handleCourseChange = (i, field, value) => {
    const copy = [...courseChapters];
    copy[i][field] = value;
    setCourseChapters(copy);
  };

  const handleQuizChange = (chapterIndex, questionIndex, field, value) => {
    const updatedChapters = [...courseChapters];
    updatedChapters[chapterIndex].quiz[questionIndex][field] = value;
    setCourseChapters(updatedChapters);
  };

  const handleOptionChange = (chapterIndex, questionIndex, optionIndex, value) => {
    const updatedChapters = [...courseChapters];
    updatedChapters[chapterIndex].quiz[questionIndex].options[optionIndex] = value;
    setCourseChapters(updatedChapters);
  };

  const handleAddQuizQuestion = (chapterIdx) => {
    const updated = [...courseChapters];
    if (!updated[chapterIdx].quiz) updated[chapterIdx].quiz = [];
    updated[chapterIdx].quiz.push({ question: '', options: ['', '', '', ''], correct: [] });
    setCourseChapters(updated);
  };

  const handleAddOption = (chapterIdx, quizIdx) => {
    const updated = [...courseChapters];
    updated[chapterIdx].quiz[quizIdx].options.push('');
    setCourseChapters(updated);
  };

  const handleRemoveOption = (chapterIdx, quizIdx, optionIdx) => {
    const updated = [...courseChapters];
    updated[chapterIdx].quiz[quizIdx].options.splice(optionIdx, 1);
    updated[chapterIdx].quiz[quizIdx].correct = (updated[chapterIdx].quiz[quizIdx].correct || []).filter(idx => idx !== optionIdx);
    setCourseChapters(updated);
  };

  const addQuizQuestion = (chapterIndex) => {
    const updatedChapters = [...courseChapters];
    updatedChapters[chapterIndex].quiz.push({ question: '', options: ['', '', '', ''], correct: [] });
    setCourseChapters(updatedChapters);
  };

  const handleAddChapter = () => {
    if (courseChapters.length < 6) {
      setCourseChapters([...courseChapters, { title: '', content: '', quiz: [{ question: '', options: ['', '', '', ''], correct: [] }] }]);
    }
  };

  // --- Materials ---
  const handleDelete = id => {
    if (window.confirm('Удалить материал?')) {
      fetch(`http://localhost:3001/api/materials/${id}`, { method: 'DELETE' })
        .then(() => setMaterials(prev => prev.filter(item => item.id !== id)));
    }
  };

  const handleEdit = (id) => {
    fetch(`http://localhost:3001/api/materials/${id}`)
      .then(res => res.json())
      .then(data => {
        setEditingId(id);
        setTitle(data.title);
        setTime(data.time);
        setSection(data.section);
        setDifficulty(data.difficulty);
        setContent(data.content);
        // Теперь теги — массив объектов {id, name, color}, сохраняем выбранные id
        setSelectedTags(Array.isArray(data.tags) ? data.tags.map(tag => tag.id) : []);
        setCurrentImageUrl(`http://localhost:3001${data.image}`);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!difficulty) return alert('Выберите уровень сложности.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('time', time);
    formData.append('section', section);
    formData.append('difficulty', difficulty);
    if (image) formData.append('image', image);
    formData.append('content', content);
    formData.append("description", description);
    formData.append('tags', JSON.stringify(selectedTags));

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:3001/api/materials/${editingId}`
      : 'http://localhost:3001/api/materials';

    fetch(url, { method, body: formData })
      .then(() => {
        alert(editingId ? 'Материал обновлён!' : 'Материал добавлен!');
        setEditingId(null);
        setTitle('');
        setTime('');
        setSection('Последние материалы');
        setDifficulty('');
        setImage(null);
        setContent('');
        setSelectedTags([]);
        return fetch('http://localhost:3001/api/materials');
      })
      .then(res => res.json())
      .then(setMaterials);
  };

  // --- Courses ---
  const handleSubmitCourse = (e) => {
    e.preventDefault();
    if (!difficulty) return alert('Выберите уровень сложности.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('time', time);
    formData.append('difficulty', difficulty);
    formData.append('content', content);
    if (image) formData.append('image', image);
    if (background) formData.append('background', background);
    formData.append('chapters', JSON.stringify(courseChapters));

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `http://localhost:3001/api/courses/${editingId}` : 'http://localhost:3001/api/courses';

    fetch(url, { method, body: formData })
      .then(() => {
        alert(editingId ? 'Курс обновлён!' : 'Курс добавлен!');
        setEditingId(null);
        setTitle('');
        setTime('');
        setDifficulty('');
        setContent('');
        setCourseChapters([{ title: '', content: '', quiz: [{ question: '', options: ['', '', '', ''], correct: [] }] }]);
        return fetch('http://localhost:3001/api/courses');
      })
      .then(res => res.json())
      .then(setCourses);
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/courses').then(res => res.json()).then(setCourses);
    fetch('http://localhost:3001/api/materials')
      .then(res => res.json())
      .then(data => {
        console.log('materials:', data); // <--- ЭТО ВАЖНО!
        setMaterials(data);
      });
    fetchTags();
  }, []);


  const difficultyOptions = ['Начинающий', 'Профессионал', 'Продвинутый'];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-6 flex gap-4">
        <button onClick={() => setMode('article')} className={`px-4 py-2 rounded ${mode === 'article' ? 'bg-black text-white' : 'bg-gray-200'}`}>Статья</button>
        <button onClick={() => setMode('course')} className={`px-4 py-2 rounded ${mode === 'course' ? 'bg-black text-white' : 'bg-gray-200'}`}>Курс</button>
      </div>

      {mode === 'article' && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Добавить материал</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Заголовок" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400" />
            <input type="number" placeholder="Время (мин.)" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400" />
            <select value={section} onChange={e => setSection(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400">
              <option>Последние материалы</option>
              <option>Крипто для новичков</option>
              <option>Криптовалютная торговля</option>
            </select>
            {currentImageUrl && <img src={currentImageUrl} alt="preview" className="h-40 object-cover rounded" />}
            <input type="file" onChange={e => setImage(e.target.files[0])} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400" />

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Описание курса</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400"
                placeholder="Краткое описание курса/статьи для Learn & Earn"
              />
            </div>

            <div>
              <label className="font-semibold">Теги:</label>
              <div className="flex flex-wrap gap-2 mt-2">
              {(Array.isArray(tags) ? tags : []).map(tag => (
                <label key={tag.id} className="flex items-center gap-1 cursor-pointer bg-gray-100 rounded px-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleToggleTag(tag.id)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400"
                  />
                  {tag.name}
                </label>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Добавить новый тег"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400"
                />
                <button onClick={handleAddTag} className="bg-yellow-400 rounded px-3 py-1 font-semibold" type="button">
                  Добавить
                </button>
              </div>
            </div>

            <div><label className="font-semibold">Контент:</label><Editor content={content} onChange={setContent} /></div>
            <div className="mt-4">
              <label className="font-semibold">Сложность:</label>
              <div className="flex gap-2 mt-2">
                {difficultyOptions.map(level => (
                  <button type="button" key={level} onClick={() => setDifficulty(level)} className={`px-3 py-1 rounded border ${difficulty === level ? 'bg-black text-white' : 'bg-white'}`}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="bg-black text-white px-6 py-2 rounded text-lg">Сохранить</button>
          </form>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Список материалов</h2>
            <table className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">ID</th>
                  <th className="p-2">Заголовок</th>
                  <th className="p-2">Раздел</th>
                  <th className="p-2">Время</th>
                  <th className="p-2">Теги</th>
                  <th className="p-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">{item.id}</td>
                    <td className="p-2">{item.title}</td>
                    <td className="p-2">{item.section}</td>
                    <td className="p-2">{item.time} мин</td>
                    <td className="p-2">
                    {item.tags && item.tags.length > 0
                        ? item.tags.map(tag =>
                            <span
                              key={tag.id}
                              style={{
                                background: tag.color || '#F2F2F2',
                                borderRadius: 6,
                                padding: '2px 7px',
                                marginRight: 4,
                                fontSize: 13,
                                display: 'inline-block',
                              }}>
                              {tag.name}
                            </span>)
                        : <span style={{ color: '#aaa' }}>нет тегов</span>}
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Удалить</button>
                      <button onClick={() => handleEdit(item.id)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-2">Редактировать</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mode === 'course' && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Добавить курс</h1>
          <form onSubmit={handleSubmitCourse} className="space-y-4">
            <input type="text" placeholder="Заголовок курса" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400" />
            <input type="text" placeholder="Время (например, 2ч 30м)" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400" />
            <input type="file" onChange={e => setImage(e.target.files[0])} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400" />
            <input type="file" onChange={e => setBackground(e.target.files[0])} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400" />
            <div><label className="block font-semibold">Описание курса:</label><Editor content={content} onChange={setContent} /></div>
            <div><label className="block font-semibold mt-4">Уровень:</label>
              <div className="flex gap-2 mt-2">
                {difficultyOptions.map(level => (
                  <button type="button" key={level} onClick={() => setDifficulty(level)} className={`px-3 py-1 rounded border ${difficulty === level ? 'bg-black text-white' : 'bg-white'}`}>{level}</button>
                ))}
              </div>
            </div>
            {courseChapters.map((chapter, i) => (
              <div key={i} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400">
                <h3 className="font-semibold mb-2">Раздел {i + 1}</h3>
                <input
                  type="text"
                  placeholder="Название раздела"
                  value={chapter.title}
                  onChange={e => handleCourseChange(i, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400"
                />
                <Editor content={chapter.content} onChange={val => handleCourseChange(i, 'content', val)} />
                <h4 className="mt-4 font-semibold">Квиз</h4>
                {(chapter.quiz || []).map((q, qi) => (
                  <div key={qi} className="border p-3 rounded mt-2">
                    <input
                      type="text"
                      placeholder="Вопрос"
                      value={q.question}
                      onChange={e => handleQuizChange(i, qi, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400"
                    />
                    {(q.options || []).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          placeholder={`Вариант ${oi + 1}`}
                          value={opt}
                          onChange={e => handleOptionChange(i, qi, oi, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400"
                        />
                        <input
                          type="checkbox"
                          checked={q.correct && q.correct.includes(oi)}
                          onChange={() => {
                            const newCorrect = q.correct && q.correct.includes(oi)
                              ? q.correct.filter(c => c !== oi)
                              : [...(q.correct || []), oi];
                            handleQuizChange(i, qi, 'correct', newCorrect);
                          }}
                        />
                        <button type="button" onClick={() => handleRemoveOption(i, qi, oi)} className="text-red-500 text-sm">Удалить</button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddOption(i, qi)}
                      className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                    >Добавить вариант</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddQuizQuestion(i)}
                  className="mt-2 bg-yellow-400 px-4 py-2 rounded"
                >Добавить вопрос</button>
              </div>
            ))}
            {courseChapters.length < 6 && (
              <button type="button" onClick={handleAddChapter} className="bg-blue-500 text-white px-4 py-2 rounded">Добавить раздел</button>
            )}
            <button type="submit" className="bg-black text-white px-6 py-2 rounded text-lg">Сохранить курс</button>
          </form>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Список курсов</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <div key={course.id} className="border p-4 rounded">
                  <img src={`http://localhost:3001${course.image}`} alt={course.title} className="w-full h-40 object-cover mb-2 rounded" />
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">Время: {course.time}</p>
                  <p className="text-sm text-gray-500 mb-3">Сложность: {course.difficulty}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteCourse(course.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Удалить</button>
                    <button onClick={() => handleEditCourse(course)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Редактировать</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
