import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const filterOptions = [
  { value: "all", label: "Все" }
  // Здесь можно добавить фильтрацию по темам, если понадобится.
];
const sortOptions = [
  { value: "desc", label: "От новых к старым" },
  { value: "asc", label: "От старых к новым" },
];

const ARTICLES_PER_PAGE = 10;

const LearnEarn = () => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("desc");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/materials")
      .then(res => res.json())
      .then(data => {
        // Отфильтруем только Altcoin
        const filtered = data.filter(article =>
          Array.isArray(article.tags)
            ? article.tags.includes("Altcoin") ||
              article.tags.some(tag => (typeof tag === "object" ? tag.name === "Altcoin" : false))
            : false
        );
        setArticles(filtered);
        setLoading(false);
      });
  }, []);

  // Сортировка
  const sortedArticles = [...articles].sort((a, b) =>
    sort === "desc"
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at)
  );

  const totalPages = Math.ceil(sortedArticles.length / ARTICLES_PER_PAGE);
  const pageArticles = sortedArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  function Pagination({ totalPages, currentPage, setCurrentPage }) {
    if (totalPages <= 1) return null;

    const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    let pages = [];
    if (totalPages <= 7) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
      }
    }

    return (
      <div className="flex justify-center mt-10 gap-2 select-none">
        <button
          onClick={handlePrev}
          className="w-7 h-7 flex items-center justify-center text-base font-normal font-['Inter'] text-black cursor-pointer hover:bg-zinc-100"
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {pages.map((p, i) =>
          typeof p === "number" ? (
            <button
              key={i}
              className={`w-7 h-7 text-base font-normal font-['Inter'] text-black rounded cursor-pointer flex items-center justify-center ${
                p === currentPage ? "bg-zinc-200" : "hover:bg-zinc-100"
              }`}
              onClick={() => setCurrentPage(p)}
              disabled={p === currentPage}
            >
              {p}
            </button>
          ) : (
            <span key={i} className="w-7 h-7 flex items-center justify-center">...</span>
          )
        )}
        <button
          onClick={handleNext}
          className="w-7 h-7 flex items-center justify-center text-base font-normal font-['Inter'] text-black cursor-pointer hover:bg-zinc-100"
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      {/* Hero */}
      <section className="w-full bg-[#2B3139] flex justify-center pb-[250px] px-[100px] pt-[50px]">
        <div className="max-w-[1240px] w-full flex flex-col md:flex-row items-start md:items-center relative z-10">
          <div className="flex-1 min-w-[350px] z-10">
            <h1 className="text-white font-inter font-bold text-5xl md:text-6xl mb-8 leading-tight">
              Зарабатывайте <br />криптовалюту, <br />проходя обучение
            </h1>
            <div className="text-white text-2xl font-inter font-normal max-w-xl mb-8">
              Совершенствуйте свои знания о блокчейне, выполняйте тесты и зарабатывайте криптовалюту.
            </div>
            <button
              className="bg-yellow-400 hover:bg-yellow-300 text-black text-xl font-semibold font-inter rounded-lg w-64 h-14 mb-2 transition cursor-pointer"
              onClick={() => {
                if (sortedArticles.length) navigate(`/article/${sortedArticles[0].id}`);
              }}
            >
              Начать
            </button>
          </div>
          <div className="flex-1 flex justify-end items-center relative z-0 mt-10 md:mt-0">
            <img
              src="/learn-earn-hero.png"
              alt="Learn and Earn"
              className="w-[350px] md:w-[420px] lg:w-[470px] xl:w-[500px] h-auto object-contain"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* Content блок с курсами */}
      <section className="relative z-10 w-full flex justify-center mt-[-160px] md:mt-[-200px]">
        <div className="max-w-[1240px] w-full bg-white rounded-[62px]">
          {/* Фильтр и сортировка */}
          {/* Фильтр */}
          <div className="flex justify-end mt-[35px] mb-[10px] mx-[50px]">
            <select
              className="w-56 h-8 rounded-md border border-zinc-300 px-3 text-lg font-medium font-inter bg-white text-black cursor-pointer ml-4"
              value={sort}
              onChange={e => { setSort(e.target.value); setCurrentPage(1); }}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {/* Карточки */}
          {loading ? (
            <div className="w-full text-center text-black py-10 text-lg">Загрузка...</div>
          ) : (
            <div className="flex flex-col gap-[25px]">
              {pageArticles.length === 0 && (
                <div className="text-xl text-zinc-400 text-center py-8">Нет материалов</div>
              )}
              {pageArticles.map((course, idx) => (
                <div
                  key={course.id}
                  className="p-[25px] w-full bg-zinc-100 md:bg-white rounded-[30px] flex md:flex-row transition hover:bg-[#F4F4F4] cursor-pointer"
                  style={{ boxShadow: idx === 0 ? "none" : undefined }}
                  onClick={() => navigate(`/article/${course.id}`)}
                >
                  {/* Картинка */}
                  <div className="flex">
                    <div className="bg-black rounded-2xl w-[500px] h-[250px] flex justify-center items-center overflow-hidden">
                      <img
                        src={`/uploads/${course.image}`}
                        alt={course.title}
                        className="object-contain max-w-full"
                      />
                    </div>
                  </div>
                  {/* Текст и кнопка */}
                  <div className="ml-[30px] flex flex-col flex-1 justify-between">
                    <div className="text-black text-3xl md:text-4xl font-bold font-inter mb-2 leading-tight">
                      {course.title}
                    </div>
                    <div className="text-black text-base md:text-xl font-normal font-inter mb-4 max-w-[600px] line-clamp-3">
                      {course.description}
                    </div>
                    <button
                      className="bg-yellow-400 hover:bg-yellow-300 text-black text-xl font-semibold font-inter rounded-lg w-44 h-14 transition cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/article/${course.id}`);
                      }}
                    >
                      Начать
                    </button>
                  </div>
                </div>
              ))}
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LearnEarn;
