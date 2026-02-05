// src/components/LanguageSelector.jsx
import { useState, useEffect } from "react";
import vietnam from "../assets/image/VietNam.png";
import england from "../assets/image/Anh.png";
import i18n from "./MultiLang/i18n";

const LanguageSelector = () => {
  const [showLangModal, setShowLangModal] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "vi");

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved) {
      i18n.changeLanguage(saved);
      setCurrentLang(saved);
    }
  }, []);

  const toggleLangModal = (e) => {
    e.stopPropagation();
    setShowLangModal(!showLangModal);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLang(lng);
    localStorage.setItem("language", lng);
    setShowLangModal(false);
  };

  const getFlag = (lng) => (lng === "en" ? england : vietnam);

  return (
    <div className="cursor-pointer relative w-max" onClick={toggleLangModal}>
      <img
        src={getFlag(currentLang)}
        alt="Lang"
        className="w-6 h-6 rounded-full border"
      />
      {showLangModal && (
        <div
          className="absolute top-8 right-0 bg-white border border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.15)] rounded w-max z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <ul>
            <li
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => changeLanguage("vi")}
            >
              <img src={vietnam} alt="VN" className="w-5 h-5" />
              Tiếng Việt
            </li>
            <li
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => changeLanguage("en")}
            >
              <img src={england} alt="EN" className="w-5 h-5" />
              Tiếng Anh
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
