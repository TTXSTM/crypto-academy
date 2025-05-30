// === MaterialCard.jsx ===
import React from "react";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MaterialCard = ({ id, title, time, image, tags = [], created_at, difficulty }) => {
  const navigate = useNavigate();

  const difficultyStyle = {
    "Начинающий": "bg-emerald-50 text-emerald-400",
    "Средний": "bg-yellow-100 text-yellow-600",
    "Продвинутый": "bg-orange-100 text-yellow-600",
  }[difficulty] || "bg-neutral-100 text-black";

  return (
    <div
      className="w-[422px] h-[312px] relative cursor-pointer"
      onClick={() => navigate(`/article/${id}`)}
      title={title}
    >
      <div className="absolute w-full h-full bg-white border border-zinc-300 rounded-[20px]" />

      <img
        src={`http://localhost:3001${image}`}
        alt={title}
        className="absolute top-0 left-0 w-full h-[185px] object-cover rounded-t-[20px]"
      />

      {/* Сложность */}
      <div className="absolute left-[25px] top-[195px] flex gap-[3px]">
        {difficulty && (
          <div
            className={`h-5 px-2 flex items-center justify-center rounded text-[10px] font-medium ${difficultyStyle}`}
          >
            {difficulty}
          </div>
        )}
        {tags.map((tag, i) => (
          <div
            key={i}
            className="h-5 px-2 bg-neutral-100 rounded flex items-center justify-center text-[10px] text-black font-normal"
          >
            {typeof tag === "object" ? tag.name : tag}
          </div>
        ))}
      </div>

      {/* Время и дата */}
      <div className="absolute left-[25px] top-[275px] flex items-center gap-3 text-[10px] text-neutral-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{time} мин.</span>
        </div>
      </div>

      {/* Заголовок */}
      <div className="absolute left-[25px] top-[225px] w-[90%] text-black text-sm font-bold font-inter leading-tight">
        {title}
      </div>
    </div>
  );
};

export default MaterialCard;
