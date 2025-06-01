// === Article.jsx ===
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

const difficultyStyles = {
  "Начинающий": "bg-green-100 text-green-600",
  "Средний": "bg-red-100 text-red-600",
  "Продвинутый": "bg-orange-100 text-yellow-600",
};

const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);

  // Внутри компонента Article
const currentUrl = window.location.origin + `/article/${id}`;

const share = (type) => {
  let url = '';
  const text = encodeURIComponent(article.title);

  if (type === 'x') {
    url = `https://x.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${text}`;
    window.open(url, '_blank', 'width=600,height=400');
  }
  if (type === 'facebook') {
    url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }
  if (type === 'telegram') {
    url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${text}`;
    window.open(url, '_blank', 'width=600,height=400');
  }
  if (type === 'copy') {
    navigator.clipboard.writeText(currentUrl);
    alert("Ссылка скопирована!");
  }
};

  useEffect(() => {
    fetch(`/api/materials/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Материал не найден");
        return res.json();
      })
      .then((data) => setArticle(data))
      .catch(() => setArticle(null));

    fetch("/api/materials")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((a) => a.id !== +id).slice(0, 3);
        setRelated(filtered);
      });
  }, [id]);

  if (article === null) {
    return <div className="p-10 text-red-600">Материал не найден</div>;
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10 flex flex-col lg:flex-row justify-between gap-12 bg-[#FAFAFA]">
      {/* Main content */}
      <div className="max-w-[740px] w-full relative">
        {/* Категории (без сложности) */}
        <div className="flex flex-wrap gap-[5px] mb-[25px]">
          {article.tags?.map((tag, index) => (
            <div
              key={tag.id || index}
              className="min-w-[90px] h-[25px] bg-neutral-800 text-white text-[10px] font-inter rounded-xl flex items-center justify-center text-center px-1"
            >
              {tag.name}
            </div>
          ))}
        </div>

        <div className="w-[740px] h-[410px] mb-[30px]">
          <img
            src={`/uploads/${article.image}`}
            alt={article.title}
            className="w-full h-full object-cover rounded-[20px]"
          />
        </div>

        <div className="text-zinc-600 text-xl mb-[25px]">
          Главная &gt; Статьи &gt; {article.title}
        </div>

        <h1 className="text-5xl font-bold text-black mb-[15px]">{article.title}</h1>

        <div className="flex items-center mb-[15px]">
          {article.difficulty && (
            <div className={`w-40 h-9 flex items-center justify-center text-base font-medium rounded-[4px] ${
              difficultyStyles[article.difficulty] || "bg-neutral-200 text-black"
            }`}>
              {article.difficulty}
            </div>
          )}
          <div className="ml-[20px] flex items-center text-xl text-zinc-600">
            {article.created_at && (
              <span>Обновлено {new Date(article.created_at).toLocaleDateString('ru-RU')}</span>
            )}
            <Clock className="w-5 h-5 text-neutral-500 ml-[20px]" />
            <span className="text-neutral-500 ml-[5px]">{article.time} мин.</span>
          </div>
        </div>

        {/* Контент */}
        <div
          className="prose max-w-none text-zinc-700 text-xl font-['Inter']"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {/* Sidebar */}
      <aside className="w-full max-w-[300px] flex flex-col gap-10 sticky top-[100px] self-start">
        <div className="mb-6">
          <div className="text-black text-2xl font-medium font-['Inter'] mb-4">Поделиться</div>
          <div className="flex gap-4">
            <img
              src="/icons/x.svg"
              alt="X"
              onClick={() => share('x')}
              className="cursor-pointer w-7 h-7 rounded-full opacity-50 hover:opacity-100 transition-opacity duration-200"
              title="Поделиться в X"
            />
            <img
              src="/icons/facebook.svg"
              alt="Facebook"
              onClick={() => share('facebook')}
              className="cursor-pointer w-7 h-7 rounded-full opacity-50 hover:opacity-100 transition-opacity duration-200"
              title="Поделиться в Facebook"
            />
            <img
              src="/icons/telegram.svg"
              alt="Telegram"
              onClick={() => share('telegram')}
              className="cursor-pointer w-7 h-7 rounded-full opacity-50 hover:opacity-100 transition-opacity duration-200"
              title="Поделиться в Telegram"
            />
            <img
              src="/icons/copy.svg"
              alt="Copy"
              onClick={() => share('copy')}
              className="cursor-pointer w-7 h-7 rounded-full opacity-50 hover:opacity-100 transition-opacity duration-200"
              title="Скопировать ссылку"
            />
          </div>
        </div>

        <div className="rounded-[10px]">
          <div className="text-black text-2xl font-medium font-['Inter'] mb-5">
            Статьи по теме
          </div>
          <div className="flex flex-col gap-5">
            {related.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  navigate(`/article/${item.id}`);
                  window.scrollTo(0, 0);
                }}
                className="cursor-pointer"
              >
                <img
                  src={`http://localhost:3001${item.image}`}
                  className="w-full h-36 rounded-[10px] object-cover mb-2"
                  alt={item.title}
                />
                <div className="text-black text-base font-normal font-['Inter'] leading-tight">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
};

export default Article;
