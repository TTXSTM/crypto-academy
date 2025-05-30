import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all"); // 1. Состояние фильтра
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data));
  }, []);

  const goToCourse = (id) => {
    navigate(`/courses/${id}`);
    window.scrollTo(0, 0);
  };

  // 2. Фильтруем курсы по фильтру
  const filteredCourses = courses.filter((course) => {
    if (filter === "all") return true;
    if (filter === "beginner") return course.difficulty === "Начинающий";
    if (filter === "pro") return (
      course.difficulty === "Профессионал" || course.difficulty === "Продвинутый"
    );
    return true;
  });

  return (
    <main className="w-full bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="w-full h-80 bg-neutral-900 px-[50px] py-10 text-white">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row justify-between items-start">
          <div>
            <h1 className="text-yellow-500 text-5xl font-bold font-inter mb-6">
              Курсы по Web3 и<br />блокчейну
            </h1>
            <p className="text-xl font-normal font-inter max-w-[596px]">
              Расширьте свои знания о криптовалюте с помощью множества курсов по криптовалюте для самостоятельного обучения в Crypto Academy.
            </p>
          </div>
          <img src="/illustrations/courses.png" alt="Books and Hat" className="w-[500px] hidden lg:block" />
        </div>
      </section>

      {/* Course List Section */}
      <section className="px-[50px] py-14">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-black font-inter">
              Курсы Crypto Academy
            </h2>
            <select
              className="w-72 h-9 bg-white border border-stone-300 rounded-md text-base font-medium text-black px-3"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Все курсы</option>
              <option value="beginner">Для начинающих</option>
              <option value="pro">Для профессионалов</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-x-[37px] gap-y-[20px]">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="w-[422px] h-[312px] bg-white rounded-[20px] border border-zinc-300 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => goToCourse(course.id)}
              >
                <img
                  src={`${course.image}`}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-[20px]"
                />
                <div className="absolute left-[25px] top-[206px] w-72 text-black text-xl font-bold font-inter">
                  {course.title}
                </div>
                <div className="absolute left-[25px] top-[267px] text-black text-[10px] font-normal font-inter">
                  Crypto Academy
                </div>
                <Clock className="absolute left-[321px] top-[274px] w-[10px] h-[10px] text-neutral-500" />
                <div className="absolute left-[334px] top-[273px] text-neutral-500 text-[10px] font-normal font-inter">
                  {course.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CoursesPage;
