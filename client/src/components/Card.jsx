// src/components/Card.jsx
import React from "react";

const Card = ({ title, icon }) => {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition">
      {icon && (
        <img src={icon} alt="icon" className="w-6 h-6 object-contain" />
      )}
      <span className="text-sm font-medium text-gray-900">{title}</span>
    </div>
  );
};

export default Card;
