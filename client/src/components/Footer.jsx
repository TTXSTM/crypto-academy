import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-white w-full py-12 px-4">
      <div className="relative max-w-[1340px] h-56 mx-auto">

        {/* Логотип */}
        <img
          src="/LOGO.svg"
          alt="Crypto Academy Logo"
          className="w-36 h-14 absolute left-0 top-[9px] cursor-pointer"
          onClick={() => handleClick("/")}
        />

        {/* Узнать */}
        <div className="absolute left-[305px] top-0">
          <div className="text-black text-2xl font-bold">Узнать</div>
          <div
            className="text-black text-base font-normal mt-2 cursor-pointer hover:underline"
            onClick={() => handleClick("/topics")}
          >
            Темы
          </div>
          <div
            className="text-black text-base font-normal mt-2 cursor-pointer hover:underline"
            onClick={() => handleClick("/courses")}
          >
            Курсы
          </div>
          <div
            className="text-black text-base font-normal mt-2 leading-tight cursor-pointer hover:underline"
            onClick={() => handleClick("/bitcoin-halving")}
          >
            Халвинг<br />биткоина
          </div>
        </div>

        {/* Продукты */}
        <div className="absolute left-[557.6px] top-0">
          <div className="text-black text-2xl font-bold">Продукты</div>
          {[
            { name: "Конвертация", path: "/convert" },
            { name: "BCF", path: "/bcf" },
            { name: "Labs", path: "/labs" },
            { name: "Lauchpad", path: "/launchpad" },
            { name: "Исследования", path: "/research" },
            { name: "Wallet", path: "/wallet" },
          ].map(({ name, path }) => (
            <div
              key={name}
              className="text-black text-base font-normal mt-2 cursor-pointer hover:underline"
              onClick={() => handleClick(path)}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Компания */}
        <div className="absolute left-[846.5px] top-0">
          <div className="text-black text-2xl font-bold">Компания</div>
          {[
            { name: "Правила и условия", path: "/terms" },
            { name: "Политика конфиденциальности", path: "/privacy" },
            { name: "Отказ от ответственности", path: "/disclaimer" },
            { name: "Запрос контента", path: "/content-request" },
            { name: "Отзывы", path: "/reviews" },
          ].map(({ name, path }) => (
            <div
              key={name}
              className="text-black text-base font-normal mt-2 leading-tight cursor-pointer hover:underline"
              onClick={() => handleClick(path)}
            >
              {name.includes("<br/>") ? (
                <span dangerouslySetInnerHTML={{ __html: name }} />
              ) : (
                name
              )}
            </div>
          ))}
        </div>

        {/* Соцсети */}
        <div className="absolute right-0 top-0 flex space-x-3">
          {[
            { icon: "/icons/x.svg", alt: "X", href: "https://x.com" },
            { icon: "/icons/facebook.svg", alt: "Facebook", href: "https://facebook.com" },
            { icon: "/icons/telegram.svg", alt: "Telegram", href: "https://t.me" },
            { icon: "/icons/youtube.svg", alt: "YouTube", href: "https://youtube.com" },
          ].map(({ icon, alt, href }) => (
            <a key={alt} href={href} target="_blank" rel="noreferrer">
              <img src={icon} alt={alt} className="w-6 h-6 hover:opacity-80 transition cursor-pointer" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
