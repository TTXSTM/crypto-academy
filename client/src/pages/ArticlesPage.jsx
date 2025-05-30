// === ArticlesPage.jsx ===
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';

const topics = [
  'Altcoin', 'Crypto', 'Биткоин', 'Блокчейн', 'Консенсус', 'Криптография',
  'DeFi', 'Экономика', 'Основы', 'Ethereum', 'История', 'Metaverse',
  'Майнинг', 'NFT', 'Приватность', 'Безопастность', 'Технологии',
  'Технический анализ', 'Торговля', 'Руководство', 'Сценарии использования', 'Кошелек', 'Руководства по продуктам'
];

const levels = [
  { label: 'Начинающий', color: 'bg-emerald-100', value: 'Начинающий' },
  { label: 'Средний', color: 'bg-rose-200', value: 'Средний' },
  { label: 'Продвинутый', color: 'bg-orange-100', value: 'Продвинутый' }
];

const difficultyColors = {
  "Начинающий": "bg-green-100 text-green-600",
  "Средний": "bg-pink-100 text-pink-600",
  "Продвинутый": "bg-orange-100 text-yellow-600",
};

const ArticlesPage = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortOrder, setSortOrder] = useState('new');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const tagFromQuery = query.get("tag"); // Получаем тег из URL

  useEffect(() => {
    if (tagFromQuery && topics.includes(tagFromQuery)) {
      setSelectedTopics([tagFromQuery]);
    }
  }, [tagFromQuery]);

  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        setAllArticles(data);
        setArticles(data);
      });
  }, []);

  useEffect(() => {
    let filtered = [...allArticles];
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(article =>
        selectedTopics.every(selected =>
          (article.tags || []).some(tag => tag.name === selected)
        )
      );
    }
    if (selectedLevel) {
      filtered = filtered.filter(article => article.difficulty === selectedLevel);
    }
    if (sortOrder === 'old') {
      filtered.sort((a, b) => a.id - b.id);
    } else {
      filtered.sort((a, b) => b.id - a.id);
    }
    setArticles(filtered);
    setCurrentPage(1);
  }, [allArticles, selectedTopics, selectedLevel, sortOrder]);

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const toggleLevel = (level) => {
    setSelectedLevel(selectedLevel === level ? '' : level);
  };

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="max-w-[1440px] w-full px-[50px] mx-auto py-10">
      <div className="w-full bg-white py-10 flex flex-col lg:flex-row lg:items-start justify-between gap-10">
        <div className="flex-1">
          <h2 className="text-2xl font-bold font-['Inter'] mb-3">Темы в Academy</h2>
          <div className="text-xl font-medium mb-2">Темы</div>
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <button
                key={topic}
                className={`px-4 h-6 rounded-xl text-[10px] font-normal font-['Inter'] text-center cursor-pointer transition-colors duration-200 ${selectedTopics.includes(topic) ? 'bg-black text-white' : 'bg-neutral-100 text-zinc-500 hover:bg-zinc-300'}`}
                onClick={() => toggleTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-xl font-medium mb-2">Сложность</div>
          <div className="flex gap-2">
            {levels.map(({ label, color, value }) => (
              <button
                key={value}
                className={`w-24 h-5 rounded-[5px] text-[10px] text-black font-normal font-['Inter'] ${color} text-center cursor-pointer hover:brightness-90 ${selectedLevel === value ? 'ring-2 ring-black' : ''}`}
                onClick={() => toggleLevel(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 mt-10">
        <div className="text-black text-2xl font-bold font-['Inter']">Статьи ({articles.length})</div>
        <div className="relative w-72 h-7">
          <select
            className="appearance-none w-full h-full pl-3 pr-8 bg-white rounded-md border border-zinc-300 text-base font-medium font-['Inter'] text-black cursor-pointer hover:bg-zinc-100"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="new">Недавно опубликованные</option>
            <option value="old">Давно опубликованные</option>
          </select>
          <div className="absolute right-2 top-1.5 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-y-[20px] gap-x-[37px]">
        {currentArticles.map(article => (
          <div
            key={article.id}
            onClick={() => navigate(`/article/${article.id}`)}
            className="relative w-[422px] h-[312px] bg-white rounded-[20px] border border-zinc-300 cursor-pointer overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              src={`http://localhost:3001${article.image}`}
              alt={article.title}
              className="w-full h-48 object-cover rounded-tl-[20px] rounded-tr-[20px]"
            />
            <div className="absolute flex gap-2 left-[25px] top-[10px]">
              {(article.tags || []).map((tag, index) => (
                <div
                  key={tag.id || index}
                  className="px-3 h-[25px] bg-neutral-800 rounded-xl flex items-center justify-center text-white text-[10px] font-normal font-['Inter'] whitespace-nowrap"
                >
                  {tag.name}
                </div>
              ))}
            </div>
            <div className="absolute left-[25px] top-[210px] w-72 text-black text-sm font-bold font-['Inter'] leading-tight">
              {article.title}
            </div>
            <div className={`absolute left-[25px] top-[267px] w-28 h-5 ${difficultyColors[article.difficulty]?.split(' ')[0]} rounded text-center ${difficultyColors[article.difficulty]?.split(' ')[1]} text-[10px] font-medium font-['Inter'] flex items-center justify-center`}>
              {article.difficulty}
            </div>
            <Clock className="absolute left-[351px] top-[274px] w-[10px] h-[10px] text-neutral-500" />
            <div className="absolute left-[364px] top-[273px] text-neutral-500 text-[10px] font-normal font-['Inter']">
              {article.time} мин.
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10 gap-2">
        <button onClick={handlePrev} className="w-7 h-7 flex items-center justify-center text-base font-normal font-['Inter'] text-black cursor-pointer hover:bg-zinc-100">&lt;</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).concat(['...', totalPages]).map((p, i) => (
          <button
            key={i}
            className={`w-7 h-7 text-base font-normal font-['Inter'] text-black rounded cursor-pointer flex items-center justify-center ${p === currentPage ? 'bg-zinc-200' : 'hover:bg-zinc-100'}`}
            onClick={() => typeof p === 'number' && setCurrentPage(p)}
          >
            {p}
          </button>
        ))}
        <button onClick={handleNext} className="w-7 h-7 flex items-center justify-center text-base font-normal font-['Inter'] text-black cursor-pointer hover:bg-zinc-100">&gt;</button>
      </div>
    </div>
  );
};

export default ArticlesPage;
