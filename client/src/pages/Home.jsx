import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MaterialCard from "../components/MaterialCard";

const Home = () => {
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/materials")
      .then((res) => res.json())
      .then((data) => {
        setMaterials(data);
      });
  }, []);

  const latest = materials.slice(-3).reverse();
  const beginners = materials
    .filter((m) => m.section === "Крипто для новичков")
    .slice(-3)
    .reverse();
  const trading = materials
    .filter((m) => m.section === "Криптовалютная торговля")
    .slice(-3)
    .reverse();

  const goToMaterial = (id) => {
    navigate(`/article/${id}`);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Banner Section */}
      <section className="bg-[#FAFAFA] px-6 md:px-12 pt-[45px]">
        <div className="max-w-[1340px] mx-auto flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="w-[615px] h-[305px] flex flex-col justify-center">
            <span className="text-yellow-500 text-[46px] font-bold font-inter block">
              CRYPTO ACADEMY
            </span>
            <span className="text-black text-[45px] font-extrabold font-inter block leading-tight">
              ОБРАЗОВАНИЕ В<br />
              ОБЛАСТИ БЛОКЧЕЙНА И<br />
              КРИПТОВАЛЮТЫ
            </span>
            <p className="text-black text-[25px] font-normal font-inter max-w-[586px]">
              Присоединяйтесь к мировому сообществу и узнайте больше о криптовалюте и блокчейне бесплатно!
            </p>
          </div>

          <div
            className="cursor-pointer w-[637px] max-w-[1340px] h-80 bg-black rounded-[41px] relative overflow-hidden"
            onClick={() => goToMaterial(8)}
          >
            <div className="absolute top-[50px] left-[50px] w-52 h-8 rounded-[10px] border-2 border-white flex items-center justify-center">
              <span className="text-white text-base font-bold leading-none">Рекомендованное</span>
            </div>
            <div className="absolute top-[92px] left-[50px] text-white text-3xl font-bold leading-tight w-80">
              Что такое криптовалютный<br />кошелек?
            </div>
            <div className="absolute bottom-[34px] left-[50px] flex items-center space-x-2">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white text-base font-bold">14 минут</span>
            </div>
            <img
              src="/wallet.svg"
              alt="Wallet"
              className="absolute right-[50px] top-[68px] w-44 h-44 object-contain"
            />
          </div>
        </div>
      </section>

      {/* Рекомендуемое */}
      <section className="bg-[#FAFAFA] px-[50px] py-[35px]">
        <div className="max-w-[1340px] mx-auto">
          <h3 className="text-zinc-500 text-base font-bold font-inter mb-4">Рекомендуемое</h3>
          <div className="flex gap-5 overflow-x-auto">
            {[
              { id: 9, title: "Психология \nрыночных циклов", img: "/Slider1.png" },
              { id: 10, title: "Что такое \nкриптовалюта", img: "/Slider2.png" },
              { id: 11, title: "Что такое биткоин?", img: "/Slider3.png" },
              { id: 12, title: "Руководство по \nCrypto для...", img: "/Slider4.png" },
            ].map((item) => (
              <div
                key={item.id}
                className="cursor-pointer w-80 h-20 rounded-md bg-white border border-stone-300 flex items-center overflow-hidden hover:shadow"
                onClick={() => goToMaterial(item.id)}
              >
                <div className="flex-1 px-4 text-black text-base font-normal font-inter leading-snug whitespace-pre-line">
                  {item.title}
                </div>
                <img src={item.img} alt={item.title} className="w-36 h-20 object-cover rounded-r-md" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Горячие клавиши */}
      <section className="px-[50px] py-[50px]">
        <div className="max-w-[1340px] mx-auto">
          <h2 className="text-2xl font-bold text-black font-inter mb-6">Горячие клавиши</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { title: "Статьи", icon: "/hot-articles.svg", path: "/articles" },
              { title: "Курсы", icon: "/hot-courses.svg", path: "/courses" },
              { title: "Учитесь и зарабатывайте", icon: "/hot-learn-earn.svg", path: "/learn" },
              { title: "Руководство по продуктам", icon: "/hot-products.svg", path: "/articles?tag=Руководства по продуктам" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="cursor-pointer w-80 h-40 bg-white rounded-xl border border-stone-300 flex flex-col items-center justify-center hover:shadow"
                onClick={() => navigate(item.path)}
              >
                <img src={item.icon} alt={item.title} className="w-20 h-20 object-contain mb-4" />
                <span className="text-black text-xl font-semibold font-inter text-center">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Трек для новичков */}
      <section className="px-[50px]">
        <div className="w-[1340px] bg-[#FAFAFA] h-72 bg-stone-50 rounded-3xl mx-auto flex items-center px-[20px] relative overflow-hidden">
          <div className="flex-none w-[481px] h-[260px] rounded-3xl overflow-hidden mr-6">
            <img src="/track-banner.png" alt="Трек для начинающих" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between h-full py-6">
            <h2 className="text-black text-4xl font-bold font-inter mb-2">Основы криптовалют для новичков</h2>
            <p className="text-black text-base font-normal font-inter max-w-[717px] mb-6">
              Вы новичок в криптовалюте? Изучите основы на наших бесплатных кратких курсах для начинающих
            </p>
            <button
              className="cursor-pointer w-36 h-14 bg-yellow-400 rounded-lg text-black text-xl font-semibold font-inter"
              onClick={() => navigate("/courses")}
            >
              Начать
            </button>
          </div>
        </div>
      </section>

      {/* Материалы */}
      {[{
        title: "Последние материалы",
        data: latest
      }, {
        title: "Крипто для новичков",
        data: beginners
      }, {
        title: "Криптовалютная торговля для начинающих",
        data: trading
      }].map((block, idx) => (
        <section key={idx} className="px-[50px] pt-[28px]">
          <div className="max-w-[1340px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">{block.title}</h2>
              <span
                className="cursor-pointer text-xl font-normal text-black hover:underline"
                onClick={() => navigate("/articles")}
              >
                Смотреть всё &gt;
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {block.data.map((card) => (
                <div
                  key={card.id}
                  className="cursor-pointer"
                  onClick={() => goToMaterial(card.id)}
                >
                  <MaterialCard
                    id={card.id}
                    title={card.title}
                    time={card.time}
                    image={card.image}
                    tags={card.tags}
                    created_at={card.created_at}
                    difficulty={card.difficulty}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Оффер */}
      <section className="w-full h-96 bg-stone-50 rounded-3xl mt-[28px] flex flex-col items-center justify-start relative overflow-hidden">
        <h2 className="text-3xl font-extrabold text-black mt-[60px] text-center">
          Хотите стать партнером Crypto Academy?
        </h2>
        <button
          className="cursor-pointer mt-[20px] bg-yellow-400 text-black font-semibold text-base rounded-[10px] px-6 py-2"
          onClick={() => window.open('https://forms.monday.com/forms/5606d1dfea9fcbf844bf029b0e4c7006?r=euc1', '_blank')}
        >
          Присоединяйтесь
        </button>
        <div className="absolute bottom-0 w-full flex justify-center">
          <img src="/partner.svg" alt="Партнёр Crypto Academy" className="w-[300px] h-auto" />
        </div>
      </section>
    </>
  );
};

export default Home;
