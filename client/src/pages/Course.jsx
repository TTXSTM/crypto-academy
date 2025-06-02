import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../components/UserContext';
import { Helmet } from "react-helmet";

// Компонент квиза для главы
const QuizBlock = ({ quizList, onSuccess }) => {
  // answers: [[0,2], [1], ...] — массив выбранных индексов для каждого вопроса
  const [answers, setAnswers] = useState(quizList.map(() => []));
  const [result, setResult] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [allowRetry, setAllowRetry] = useState(false);

  const isMulti = q => (q.correct && q.correct.length > 1);

  const handleOptionChange = (qi, oi) => {
    if (submitted && !allowRetry) return;
    setAnswers(prev =>
      prev.map((arr, i) => {
        if (i !== qi) return arr;
        if (isMulti(quizList[qi])) {
          // Мультивыбор
          return arr.includes(oi)
            ? arr.filter(x => x !== oi)
            : [...arr, oi];
        } else {
          // Только один выбор (single)
          return [oi];
        }
      })
    );
  };

  const handleSubmit = () => {
    const res = quizList.map((q, i) => {
      const userAns = [...(answers[i] || [])].sort().join(',');
      const correctAns = [...(q.correct || [])].sort().join(',');
      return userAns === correctAns;
    });
    setResult(res);
    setSubmitted(true);
    setAllowRetry(!res.every(Boolean));
    if (res.every(Boolean)) onSuccess?.();
  };

  const handleRetry = () => {
    setSubmitted(false);
    setAllowRetry(false);
    setAnswers(quizList.map(() => []));
    setResult([]);
  };

  return (
    <div className="mt-10 bg-[#FAFAFA] rounded-xl p-8 shadow">
      {quizList.map((q, qi) => (
        <div key={qi} className="mb-6">
          <div className="font-bold text-2xl mb-4">{q.question}</div>
          {q.options.map((opt, oi) => {
  const selected = (answers[qi] || []).includes(oi);
  let bg = "bg-white", border = "border border-gray-300";
  if (submitted) {
    if (selected && q.correct.includes(oi)) {
      bg = "bg-green-100"; border = "border-green-500";
    } else if (selected && !q.correct.includes(oi)) {
      bg = "bg-red-100"; border = "border-red-500";
    }
  } else if (selected) {
    bg = "bg-yellow-100"; border = "border-yellow-500";
  }
  // --- убираем чекбоксы/радио вообще ---
  return (
    <div
      key={oi}
      className={`rounded-lg mb-2 px-5 py-3 cursor-pointer text-lg ${bg} ${border} select-none flex items-center`}
      onClick={() => handleOptionChange(qi, oi)}
      style={{
        pointerEvents: submitted && !allowRetry ? "none" : "auto"
      }}
    >
      {/* Без input, просто стилизованный div для пустого квадратика */}
      <span
        className="inline-block mr-3 w-5 h-5 rounded border border-gray-400 bg-white"
        style={{
          background: selected
            ? (submitted
                ? (q.correct.includes(oi)
                    ? '#bbf7d0' // зелёный при правильном
                    : '#fecaca') // красный при неправильном
                : '#fde68a') // желтый при выборе
            : '#fff'
        }}
      />
      {opt}
    </div>
  );
})}

        </div>
      ))}

      {/* Кнопки — всегда слева */}
      <div className="mt-4 flex items-center">
        {!submitted && (
          <button
            className={`px-8 py-3 rounded text-lg ${
              answers.some((a, i) =>
                (isMulti(quizList[i]) ? a.length === 0 : a.length !== 1)
              )
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-400 text-black'
            }`}
            disabled={answers.some((a, i) =>
              isMulti(quizList[i]) ? a.length === 0 : a.length !== 1
            )}
            onClick={handleSubmit}
          >
            Отправить
          </button>
        )}
        {submitted && result.every(Boolean) && (
          <button
            className="bg-yellow-400 text-black font-semibold px-8 py-3 rounded text-lg"
            onClick={onSuccess}
          >
            Далее
          </button>
        )}
        {submitted && !result.every(Boolean) && (
          <button
            className="bg-gray-200 text-black px-8 py-3 rounded text-lg"
            onClick={handleRetry}
          >
            Попробовать снова
          </button>
        )}
      </div>
    </div>
  );
};


const getProgress = (courseId) => {
  try {
    return JSON.parse(localStorage.getItem(`progress_${courseId}`)) || [];
  } catch {
    return [];
  }
};

const setProgress = (courseId, completed) => {
  localStorage.setItem(`progress_${courseId}`, JSON.stringify(completed));
};

const Course = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext); 
  const [course, setCourse] = useState(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState([]);
  const quizRef = useRef(null);

  const handleStart = async () => {
    if (user && course?.id) {
      await fetch('/api/user-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, course_id: course.id })
      });
    }
    if (quizRef.current) quizRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleChapterComplete = async () => {
    const updated = [...completedChapters];
    updated[activeChapter] = true;
    setCompletedChapters(updated);
    setProgress(course.id, updated);

    if (user && course?.id) {
      await fetch('/api/user-courses/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          course_id: course.id,
          progress: updated.filter(Boolean).length,
          status: updated.filter(Boolean).length === course.chapters.length ? 'completed' : 'in-progress'
        })
      });
    }
    if (activeChapter < course.chapters.length - 1) setActiveChapter(activeChapter + 1);
  };

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при загрузке курса');
        return res.json();
      })
      .then(data => {
        setCourse(data);
        setCompletedChapters(getProgress(data.id));
      })
      .catch(err => console.error('Ошибка загрузки курса:', err));
  }, [id]);

   if (!course) return <div className="p-10 text-center text-xl">Загрузка...</div>;

  const chapter = course.chapters[activeChapter] || {};
  const allCompleted = completedChapters.length === course.chapters.length &&
    completedChapters.every(Boolean);

  return (
    <>
    <Helmet>
      <title>{course.title} | Crypto Academy</title>
      <meta name="description" content="Crypto Academy — бесплатное образование по криптовалютам и блокчейну для всех!" />
    </Helmet>
    <div className="bg-white font-['Inter'] text-black min-h-screen">
      {/* Хедер */}
      <div className='bg-[#0A0B0D]'>
        <div
          className="relative max-w-[1340px] mx-auto h-[384px] flex items-stretch text-white px-[50px]"
          style={{
            backgroundColor: "#0A0B0D",
            backgroundImage: course.background ? `url(${course.background})` : "none",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
            backgroundSize: "contain",
          }}
        >
          <div className="flex flex-col justify-center py-[52px] w-[700px] z-10">
            <h1 className="text-[56px] font-bold leading-tight text-yellow-500 mb-2">{course.title}</h1>
            <p className="text-[24px] mb-6">{course.subtitle || "Основы криптовалют и блокчейна"}</p>
            <div className="flex gap-24 mb-7">
              <div>
                <div className="text-yellow-500 text-[24px] font-bold mb-1">{course.difficulty || "Начинающий"}</div>
                <div className="text-white text-lg opacity-90">Уровень</div>
              </div>
              <div>
                <div className="text-yellow-500 text-[24px] font-bold mb-1">{course.time || "Время"}</div>
                <div className="text-white text-lg opacity-90">Время на выполнение</div>
              </div>
            </div>
            <button onClick={handleStart} className="cursor-pointer bg-yellow-400 text-black text-[24px] font-semibold rounded-xl px-8 py-3 w-[150px] hover:bg-yellow-300 transition">
              Начать
            </button>
          </div>
        </div>
      </div>

      {/* Основной контент курса */}
      <div className="max-w-[1240px] mx-auto py-16 px-6">
        <div className="text-xl mb-10" dangerouslySetInnerHTML={{ __html: course.content }} />
        {/* Учебный план */}
        <h3 className="text-4xl font-bold mb-6">Учебный план</h3>
        <div className="space-y-4 mb-12">
          {course.chapters?.map((chapter, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-[5px] h-14 px-6 cursor-pointer ${i === activeChapter ? 'border-2 border-yellow-400 bg-white' : 'bg-zinc-100'}`}
              onClick={() => setActiveChapter(i)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                ${completedChapters[i] ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                {completedChapters[i] ? '✓' : ''}
              </div>
              <div className="text-xl font-bold">{i + 1}. {chapter.title}</div>
            </div>
          ))}
          <div className="flex justify-between items-center bg-zinc-100 rounded-[5px] h-20 px-6 mt-6">
            <div className="text-xl font-bold">Закончить курс</div>
            <button className={`rounded-lg text-black text-xl font-semibold px-6 py-3 ${allCompleted ? 'bg-yellow-400' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`} disabled={!allCompleted}>
              Закончить
            </button>
          </div>
        </div>

        {/* Активная глава: контент + квиз */}
        <div className="bg-white rounded-2xl shadow mb-10">
          <div className="text-2xl font-bold mb-4">{chapter.title}</div>
          <div ref={quizRef} className="mb-6 text-lg" dangerouslySetInnerHTML={{ __html: chapter.content }} />
          {chapter.quiz && chapter.quiz.length > 0 &&
            <QuizBlock key={activeChapter} quizList={chapter.quiz} onSuccess={handleChapterComplete} />
          }
        </div>
      </div>
    </div>
    </>
  );
};

export default Course;
