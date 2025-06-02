// AuthModal.jsx
import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext";
import { Helmet } from "react-helmet";

const EMAIL_PHONE_REGEX = /^[\w-+.]+@([\w-]+\.)+[\w-]{2,7}$|^\d{10,15}$/;

function AuthModal({ type, setType, onClose }) {
  const [step, setStep] = useState(1);
  const { setUser } = useContext(UserContext);

  // Поля формы
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  // Шаг 1 — проверка Email/Телефон
  const handleNext = () => {
    if (!EMAIL_PHONE_REGEX.test(emailOrPhone.trim())) {
      setError("Введите корректный e-mail или номер телефона");
      return;
    }
    setError("");
    setStep(2);
  };

  // Вход
  const handleLogin = async () => {
    if (!password) {
      setError("Введите пароль");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone,
          password,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);         // <---- Вот тут сохраняй пользователя!
        onClose();
      } else {
        setError(data.error || "Ошибка входа");
      }
    } catch (e) {
      setError("Ошибка соединения с сервером");
    }
  };

  // Регистрация
  const handleRegister = async () => {
    if (!password || !repeatPassword || !nickname) {
      setError("Заполните все поля");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (password !== repeatPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (nickname.length < 3) {
      setError("Никнейм слишком короткий");
      return;
    }
    setError("");
    try {
      const isEmail = EMAIL_PHONE_REGEX.test(emailOrPhone.trim()) && emailOrPhone.includes("@");
      const body = {
        email: isEmail ? emailOrPhone.trim() : "",
        phone: !isEmail ? emailOrPhone.trim() : "",
        password,
        nickname
      };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);         // <---- Вот тут сохраняй пользователя!
        onClose();
      } else {
        setError(data.error || "Ошибка регистрации");
      }
    } catch (e) {
      setError("Ошибка соединения с сервером");
    }
  };

  // UI
  return (
    <>
    <Helmet>
        <title>Вход и регистрация| Crypto Academy</title>
        <meta name="description" content="Crypto Academy — бесплатное образование по криптовалютам и блокчейну для всех!" />
    </Helmet>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#181A20] p-8 rounded-2xl w-[380px] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-white hover:text-yellow-400 text-2xl font-bold"
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          <img
            src="/LOGO.svg"
            alt="Crypto Academy"
            className="h-8 mb-6"
            draggable={false}
          />
          <h2 className="text-2xl font-bold text-white mb-3">
            {type === "login" ? "Войти" : "Регистрация"}
          </h2>
          {step === 1 && (
            <>
              <label className="text-left w-full text-gray-300 mb-2 text-sm">
                Эл. почта/номер телефона
              </label>
              <input
                type="text"
                className="w-full h-12 rounded-md px-3 mb-3 border border-[#d1b20b] bg-[#181A20] text-white outline-none focus:ring-2 ring-yellow-400 transition"
                placeholder="Адрес эл. почты/номер телефона (без кода)"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                autoFocus
              />
              <button
                className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 rounded-md font-semibold text-black mt-2 transition cursor-pointer"
                onClick={handleNext}
              >
                Далее
              </button>
              {error && (
                <div className="text-red-500 text-center mt-3 mb-1 text-sm">
                  {error}
                </div>
              )}
              <div className="text-center mt-8">
                {type === "login" ? (
                  <span
                    className="text-yellow-400 text-base font-normal cursor-pointer hover:underline"
                    onClick={() => {
                      setType("register");
                      setStep(1);
                      setError("");
                      setEmailOrPhone("");
                      setPassword("");
                    }}
                  >
                    Создать аккаунт Crypto Academy
                  </span>
                ) : (
                  <span
                    className="text-yellow-400 text-base font-normal cursor-pointer hover:underline"
                    onClick={() => {
                      setType("login");
                      setStep(1);
                      setError("");
                      setEmailOrPhone("");
                      setPassword("");
                    }}
                  >
                    Войти в систему
                  </span>
                )}
              </div>
            </>
          )}

          {step === 2 && type === "login" && (
            <>
              <label className="text-left w-full text-gray-300 mb-2 text-sm">
                Пароль
              </label>
              <input
                type="password"
                className="w-full h-12 rounded-md px-3 mb-3 border border-gray-600 bg-[#181A20] text-white outline-none focus:ring-2 ring-yellow-400 transition"
                placeholder="Введите пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <button
                className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 rounded-md font-semibold text-black mt-2 transition cursor-pointer"
                onClick={handleLogin}
              >
                Войти
              </button>
              {error && (
                <div className="text-red-500 text-center mt-3 mb-1 text-sm">
                  {error}
                </div>
              )}
              <button
                className="mt-3 text-yellow-300 hover:underline text-sm"
                onClick={() => setStep(1)}
              >
                ← Назад
              </button>
            </>
          )}

          {step === 2 && type === "register" && (
            <>
              <label className="text-left w-full text-gray-300 mb-2 text-sm">
                Придумайте пароль
              </label>
              <input
                type="password"
                className="w-full h-12 rounded-md px-3 mb-2 border border-gray-600 bg-[#181A20] text-white outline-none focus:ring-2 ring-yellow-400 transition"
                placeholder="Пароль (мин. 6 символов)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <label className="text-left w-full text-gray-300 mb-2 text-sm">
                Повторите пароль
              </label>
              <input
                type="password"
                className="w-full h-12 rounded-md px-3 mb-2 border border-gray-600 bg-[#181A20] text-white outline-none focus:ring-2 ring-yellow-400 transition"
                placeholder="Повторите пароль"
                value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)}
              />
              <label className="text-left w-full text-gray-300 mb-2 text-sm">
                Никнейм
              </label>
              <input
                type="text"
                className="w-full h-12 rounded-md px-3 mb-3 border border-gray-600 bg-[#181A20] text-white outline-none focus:ring-2 ring-yellow-400 transition"
                placeholder="Ваш никнейм"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
              />
              <button
                className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 rounded-md font-semibold text-black mt-2 transition cursor-pointer"
                onClick={handleRegister}
              >
                Зарегистрироваться
              </button>
              {error && (
                <div className="text-red-500 text-center mt-3 mb-1 text-sm">
                  {error}
                </div>
              )}
              <button
                className="mt-3 text-yellow-300 hover:underline text-sm"
                onClick={() => setStep(1)}
              >
                ← Назад
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default AuthModal;
