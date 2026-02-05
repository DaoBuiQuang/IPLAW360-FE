import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationPopup({ title, body, id, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // const handleClick = () => {
  //   navigate(`/notificationdetail/${id}`);
  //   onClose(); // đóng popup luôn nếu cần
  // };a

  return (
    <div
      className="fixed bottom-5 right-5 z-50 bg-white border-l-4 border-blue-500 shadow-lg p-4 rounded-lg w-80 animate-slide-in cursor-pointer"
    // onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
          <p className="text-gray-600 mt-1">{body}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // ngăn không trigger handleClick
            onClose();
          }}
          className="ml-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
