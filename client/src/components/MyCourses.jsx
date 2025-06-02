import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

// Для примера, если пусто — используйте свою SVG или png
const EmptyCoursesSvg = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="60" fill="#FFE49C" />
    <rect x="45" y="85" width="30" height="10" rx="5" fill="#F4D144" />
    <rect x="52" y="35" width="16" height="38" rx="8" fill="#222" />
    <rect x="58" y="25" width="4" height="18" rx="2" fill="#222" />
    <circle cx="60" cy="35" r="6" fill="#F4D144" />
  </svg>
);

export default function MyCourses() {
  const { user } = useContext(UserContext);
  const [tab, setTab] = useState("in-progress");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/user-courses/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const filtered = courses.filter(c =>
    tab === "in-progress" ? c.status === "in-progress" : c.status === "completed"
  );

  return (
    <>
    <Helmet>
      <title>Мои курсы | Crypto Academy</title>
      <meta name="description" content="Crypto Academy — бесплатное образование по криптовалютам и блокчейну для всех!" />
    </Helmet>
    <div className="max-w-[1200px] mx-auto pt-12 pb-20">
      <h1 className="text-4xl font-black text-black mb-10">Трек для начинающих</h1>
      {/* Tabs */}
      <div className="flex gap-10 mb-8">
        <button
          onClick={() => setTab("in-progress")}
          className={`pb-2 text-lg font-semibold border-b-2 transition ${
            tab === "in-progress" ? "border-yellow-400 text-black" : "border-transparent text-gray-400"
          }`}
        >
          В процессе
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`pb-2 text-lg font-semibold border-b-2 transition ${
            tab === "completed" ? "border-yellow-400 text-black" : "border-transparent text-gray-400"
          }`}
        >
          Завершено
        </button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-gray-400">Загрузка...</span>
        </div>
      ) : filtered.length ? (
        <div className="space-y-10">
          {filtered.map(courses => (
            <div
              key={courses.id}
              className="flex items-center rounded-2xl bg-white shadow px-8 py-6 gap-7"
            >
              <img
                src={courses.image || "/default-course.png"}
                alt={courses.title}
                className="w-[220px] h-[140px] rounded-xl object-cover bg-stone-100"
                draggable={false}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-2">{courses.title}</h2>
                <div className="flex items-center gap-2 text-gray-500 mb-2 text-base">
                  <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx={12} cy={12} r={10} /><path d="M12 6v6l4 2" /></svg>
                  {courses.duration || courses.time || "—"} мин.
                </div>
                {/* Прогресс */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex gap-1 items-center">
                    {[...Array(courses.chapters || 5)].map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 w-14 rounded`}
                        style={{ background: idx < (courses.progress || 0) ? "#F4D144" : "#EFF2F5" }}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm font-bold">
                    {(courses.progress || 0)} / {(courses.chapters || 5)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4 min-w-[190px]">
                {tab === "in-progress" ? (
                  <button
                    className="w-full bg-yellow-400 hover:bg-yellow-300 rounded-lg px-5 py-3 font-semibold text-black transition"
                    onClick={() => navigate(`/courses/${courses.id}`)}
                  >
                    Продолжить обучение
                  </button>
                ) : (
                  <button className="w-full bg-gray-200 text-gray-500 rounded-lg px-5 py-3 font-semibold cursor-default">
                    Завершено
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Нет курсов — Binance style
        <div className="flex flex-col items-center mt-20 text-xl text-gray-400">
          <div className="mb-8">
            <EmptyCoursesSvg />
          </div>
          <div className="mb-2 text-xl font-medium text-gray-700">
            {tab === "in-progress"
              ? "Вы пока не начали ни одного курса."
              : "Пройденные курсы появятся на этой странице."}
          </div>
          <button
            className="mt-8 bg-yellow-400 hover:bg-yellow-300 text-black px-7 py-3 rounded-lg font-bold text-base shadow transition"
            onClick={() => navigate("/courses")}
          >
            Начать обучение
          </button>
        </div>
      )}
    </div>
    </>
  );
}
