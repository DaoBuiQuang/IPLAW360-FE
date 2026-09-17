import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from 'react-redux';
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 ) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

/**
 * Gọi API linh hoạt
 * @param {string} method - Phương thức HTTP ('get', 'post', 'put', 'delete')
 * @param {string} endpoint - Đường dẫn API (ví dụ: '/users')
 * @param {Object} data - Dữ liệu gửi đi (dành cho post, put)
 * @param {Object} params - Tham số query (dành cho get, delete)
 * @returns {Promise} - Trả về kết quả API
 */
const callAPI = async ({ method = "post", endpoint, data = null, params = null }) => {
    const maNhanSu = localStorage.getItem("maNhanSu");
    try {
        const response = await api({
            method,
            url: endpoint,
            data: { ...data, maNhanSuCapNhap: maNhanSu, },
            params,
        });
        if (
            method.toLowerCase() === "post" &&
            endpoint.toLowerCase().endsWith("/delete") &&
            response.data?.message
        ) {
            toast.success(`${response.data.message}`, { position: "top-right", autoClose: 3000 });
        }
        return response.data;
    } catch (error) {
        let errorMessage = error.response?.data?.message || "Lỗi kết nối đến server!";
        if (
            typeof errorMessage === "string" &&
            (errorMessage.toLowerCase() === "validation error" ||
             errorMessage.toLowerCase().includes("validation error"))
        ) {
            errorMessage = "Dữ liệu không hợp lệ hoặc mã công việc đã tồn tại trong hệ thống. Vui lòng kiểm tra lại!";
        }
        toast.error(`🚨 ${errorMessage}`, { position: "top-right", autoClose: 3500 });
        console.error("Lỗi API:", errorMessage);
        throw errorMessage;
    }
};

export default callAPI;
