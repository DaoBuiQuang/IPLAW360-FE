import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setAuth } from "../../features/authSlice";
import { showSuccess, showError } from "../../components/commom/Notification";
// import { messaging, getToken, onMessage } from '../../firebase';
import { messaging } from '../../firebase';
import { getToken } from "firebase/messaging";
// import { getToken, onMessage } from "../../firebase/messaging";
import logoweb from "../../assets/image/logo-web-big.jpg";
const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/Login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Đăng nhập thất bại");
            }

            const data = await response.json();

            if (data && data.token) {
                localStorage.setItem("token", data.token);
                const decoded = jwtDecode(data.token);
                localStorage.setItem("maNhanSu", decoded.maNhanSu);
                dispatch(setAuth({ authId: decoded.id, role: decoded.role }));

                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    if (messaging) {
                        // Chỉ gọi getToken khi messaging không undefined/null
                        try {
                            const fcmToken = await getToken(messaging, {
                                vapidKey: "BO8l5RV8jUti5DfRNG6DVGNpAqkQUH8wCxZETSVjCfBA3awtoq-QOwUqeM2tvFKXBNtrfW1WjKCxicXLt-VSPK0",
                            });
                            if (fcmToken) {
                                console.log("FCM token sau login:", fcmToken);
                                await registerFCMToken(fcmToken);
                            }
                        } catch (err) {
                            console.warn("Lấy FCM token thất bại:", err);
                        }
                    } else {
                        console.warn("Firebase Messaging không khả dụng trong môi trường này.");
                    }
                }

                await showSuccess("Thành công!", "Đăng nhập thành công!");
                navigate("/");
            } else {
                throw new Error("Đăng nhập thất bại. Không nhận được token.");
            }
        } catch (err) {
            showError("Thất bại!", "Đăng nhập không thành công.", err);
            setError(err.message || "Đăng nhập thất bại!");
        }
    };

    const registerFCMToken = async (token) => {
        try {
            const maNhanSu = localStorage.getItem("maNhanSu");
            if (!maNhanSu) {
                console.warn("Không có mã nhân sự, không gửi FCM token");
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}/save-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ maNhanSu, token }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi khi gửi FCM token");
            }

            console.log("✅ FCM token đã gửi lên server!");
        } catch (error) {
            console.error("❌ Lỗi khi gửi token lên server:", error);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[#009999]">

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    {/* <img
                        src="https://ipac.vn/image/catalog/logo/rsz_1logo.jpg"
                        alt="Logo"
                        className="w-28"
                    /> */}
                     <img src={logoweb} alt="Logo" className="w-32" />
                </div>

                <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
                    Chào mừng trở lại!
                </h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4" onKeyDown={(e) => e.key === 'Enter' && handleLogin()}>

                    <div>
                        <label className="block text-gray-700 text-left text-sm font-medium mb-1">Tài khoản</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập tài khoản"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left text-sm font-medium mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mật khẩu"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleLogin}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition duration-200"
                    >
                        Đăng nhập
                    </button>
                </div>

                {/* <div className="mt-6 text-center text-sm text-gray-600 space-y-1">
                    <p>
                        Chưa có tài khoản?{" "}
                        <a href="#" className="text-blue-500 hover:underline font-medium">Đăng ký</a>
                    </p>
                    <p>
                        <a href="#" className="text-blue-500 hover:underline font-medium">Quên mật khẩu?</a>
                    </p>
                </div> */}
            </div>
        </div>
    );
};

export default Login;
