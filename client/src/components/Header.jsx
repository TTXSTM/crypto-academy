import { Link } from "react-router-dom";
import React, { useState, useContext } from "react";
import Logo from "/LOGO.svg"; // путь должен быть корректным!
import AuthModal from "./AuthModal";
import { UserContext } from "./UserContext";
import ProfileMenu from "./ProfileMenu";

const Header = () => {
  const [authType, setAuthType] = useState(null);
  const { user, setUser } = useContext(UserContext);

  return (
    <header className="w-full flex items-center justify-between px-[50px] py-[25px] border-b border-gray-200 bg-white">
      {/* Левая часть: логотип и навигация */}
      <div className="flex items-center gap-12">
        <Link to="/" className="select-none">
          <img src={Logo} alt="Crypto Academy" className="w-[71px] h-[35px]" />
        </Link>

        <nav className="flex gap-8 text-[15px] font-medium text-black">
          <Link to="/articles" className="hover:text-yellow-500 transition">Статьи</Link>
          <Link to="/courses" className="hover:text-yellow-500 transition">Курсы</Link>
          <Link to="/learn" className="hover:text-yellow-500 transition">Учитесь и зарабатывайте</Link>
        </nav>
      </div>

      {/* Правая часть: кнопки */}
      <div className="flex gap-3">
        {!user ? (
          <>
            <button
              className="px-4 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 transition"
              onClick={() => setAuthType("login")}
            >
              Войти
            </button>
            <button
              className="px-4 py-2 rounded-md text-sm bg-yellow-400 hover:bg-yellow-500 transition text-black"
              onClick={() => setAuthType("register")}
            >
              Регистрация
            </button>
          </>
        ) : (
          <ProfileMenu user={user} setUser={setUser} />
        )}
        {authType && (
          <AuthModal
            type={authType}
            setType={setAuthType} // <--- обязательно прокидывай setType!
            onClose={() => setAuthType(null)}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
