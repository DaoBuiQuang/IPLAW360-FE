import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AppRoutes from "./routes/AppRoutes";
// import { AuthProvider } from "./components/AuthContext/AuthContext.js";
import { setAuth } from "./features/authSlice";
import { useDispatch } from 'react-redux';
import "./App.css";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import { messaging } from './firebase';
import { getToken, onMessage } from "firebase/messaging";
import { triggerNotificationRefresh } from "./features/notificationSlice";
export default function App() {
  const dispatch = useDispatch();
  const [notification, setNotification] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        dispatch(setAuth({ authId: decoded.id, role: decoded.role, maNhanSu: decoded.maNhanSu }));
        localStorage.setItem("maNhanSu", decoded.maNhanSu);

      } catch (error) {
        console.error("Token không hợp lệ:", error);
      }
    }
  }, [dispatch]);
  useEffect(() => {
    if (!messaging) {
      console.warn("Firebase Messaging không khả dụng trong môi trường này.");
      return; // thoát luôn, không chạy tiếp nếu messaging không có
    }

    const registerFCMToken = async (token) => {
      try {
        const maNhanSu = localStorage.getItem("maNhanSu");
        if (!maNhanSu) {
          console.warn("Không có mã nhân sự, không gửi FCM token");
          return;
        }

        await fetch(`${process.env.REACT_APP_API_URL}/save-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ maNhanSu, token }),
        });
        console.log("FCM token đã gửi lên server!");
      } catch (error) {
        console.error("Lỗi khi gửi token lên server:", error);
      }
    };

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, {
          vapidKey: "BO8l5RV8jUti5DfRNG6DVGNpAqkQUH8wCxZETSVjCfBA3awtoq-QOwUqeM2tvFKXBNtrfW1WjKCxicXLt-VSPK0",
        })
          .then((currentToken) => {
            if (currentToken) {
              console.log("FCM Token:", currentToken);
              registerFCMToken(currentToken);
            } else {
              console.log("Không có token FCM khả dụng.");
            }
          })
          .catch((err) => {
            console.error("Lỗi khi lấy FCM token:", err);
          });
      } else {
        console.warn("Người dùng từ chối nhận thông báo.");
      }
    });

    onMessage(messaging, (payload) => {
      console.log("📨 Nhận foreground:", payload);
      const { title, body } = payload.notification;
      const { id } = payload.data;
      dispatch(triggerNotificationRefresh());
      setNotification({ title, body, id });
    });
  }, []);

  return (
    <div className="App">
      {/* <AuthProvider> */}
      <ToastContainer />
      <AppRoutes notification={notification} setNotification={setNotification} />
      {/* </AuthProvider> */}
    </div>
  );
}

