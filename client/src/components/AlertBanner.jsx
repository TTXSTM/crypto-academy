import React from "react";

const AlertBanner = () => {
  return (
    <div className="h-14 w-full bg-yellow-100 flex items-center justify-center gap-3 text-sm">
      <img src="/Group 107 1.svg" alt="gift" className="w-5 h-5" />
      <span className="text-black">Начни изучать криптовалюту сейчас</span>
      <button className="cursor-pointer ml-4 bg-yellow-400 hover:bg-yellow-500 text-sm font-medium px-4 py-1.5 rounded-md transition">
        Изучить
      </button>
    </div>
  );
};

export default AlertBanner;
