import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  BookOpen,
  LogOut,
  BadgeCheck,
  CreditCard,
  ChevronRight,
} from "lucide-react"; // lucide-react для иконок (можешь заменить на любые SVG)

export default function ProfileMenu({ user, setUser }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setOpen(false);
  };

  // mask email for privacy
  const maskedEmail = user.email
    ? user.email.replace(/(.{2}).+(@.+)/, "$1***$2")
    : user.phone || "";

  return (
    <div className="relative">
      {/* Кнопка профиля */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-8 h-8 flex items-center justify-center rounded-full bg-white shadow transition ring-2 ${
          open ? "ring-yellow-400" : "ring-zinc-200"
        }`}
      >
        <User
          size={20}
          className={`transition ${open ? "text-yellow-400" : "text-neutral-700"}`}
        />
      </button>

      {/* Само меню */}
      {open && (
        <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl py-6 px-7 z-50 border border-neutral-200">
          {/* Email */}
          <div className="mb-2 text-lg font-semibold text-zinc-900">{maskedEmail}</div>

          {/* Ссылки */}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className="flex items-center gap-3 w-full py-2 px-2 rounded-lg hover:bg-zinc-50 text-[16px] text-zinc-800 font-medium transition mb-1"
          >
            <User size={20} className="text-neutral-400" />
            Настройки
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate("/my-courses");
            }}
            className="flex items-center gap-3 w-full py-2 px-2 rounded-lg hover:bg-zinc-50 text-[16px] text-zinc-800 font-medium transition mb-1"
          >
            <BookOpen size={20} className="text-neutral-400" />
            Мои курсы
          </button>
          <div className="border-t border-zinc-200 my-3" />
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full py-2 px-2 rounded-lg hover:bg-zinc-50 text-[16px] text-red-500 font-medium transition"
          >
            <LogOut size={20} className="text-red-400" />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
