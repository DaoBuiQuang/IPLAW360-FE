import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "../../src/features/authSlice";
import callAPI from "../utils/api";
import { Menu, Bell } from "lucide-react";
import i18n from "../components/MultiLang/i18n.js";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector.js";
import NotificationDropdown from "./NotificationDropdown";
import { Modal } from "antd";
import logoweb from "../assets/image/logo-web-big.jpg";
function Header({ toggleMenu, isMenuOpen }) {
  const [username, setUsername] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "vi");
  const authId = useSelector((state) => state.auth.authId);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    // Lấy token và username như trước
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp > now) {
          setUsername(decoded.tenNhanSu || t("username"));
        } else {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
    const saved = localStorage.getItem("language");
    if (saved) {
      i18n.changeLanguage(saved);
      setCurrentLang(saved);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await callAPI({ method: "post", endpoint: "/logout", data: { authId } });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      dispatch(clearAuth());
      navigate("/login");
    }
  };
  return (
    <>
      <header
        className="bg-white shadow-md px-6 py-3 flex items-center justify-between"
        style={{
          width:
            isMenuOpen && window.innerWidth >= 1024
              ? "calc(100vw - 280px)"
              : "100vw",
        }}
      >
        {/* <div className="p-1">
          <img src="https://ipac.vn/image/catalog/Logo-Slogan-PNG.png" alt="Logo" className="w-1" />
        </div> */}
        <button
          className="text-gray-600 hover:text-gray-800"
          onClick={toggleMenu}
        >
          <Menu size={24} color="#009999" />
        </button>

        {username && (
          <div className="flex items-center gap-4 ">
            {/* Hiển thị cờ hiện tại */}
            <LanguageSelector />
            <span className="text-gray-700 font-medium">{username}</span>

            <div className="relative cursor-pointer">
              <NotificationDropdown />

              {/* <Bell size={22} className="text-gray-600 hover:text-blue-600" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span> */}
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              {t("logout")}
            </button>
          </div>
        )}
      </header>

      {/* Modal xác nhận đăng xuất */}
      <Modal
        title={t("logoutTitle")}
        open={showLogoutModal}
        onOk={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        okText={t("logout")}
        cancelText={t("cancel")}
        okButtonProps={{ className: "bg-red-500 hover:bg-red-600 text-white" }}
      >
        <p>{t("confirmLogout")}</p>
      </Modal>
    </>
  );
}

export default Header;
