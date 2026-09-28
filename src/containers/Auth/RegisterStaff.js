import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
function RegisterStaff() {
  const navigate = useNavigate();
  const { maNhanSu } = useParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");

  const handleRegister = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/register",
        data: {
          maNhanSu,
          username,
          password,
          role,
        },
      });
      await showSuccess("Thành công!", "Tạo tài khoản thành công!");
      navigate(-1);
    } catch (error) {
      console.error("Lỗi khi tạo tài khoản!", error);
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Tạo tài khoản nhân sự</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-left">Mã nhân sự</label>
          <input
            type="text"
            value={maNhanSu}
            disabled
            className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200 cursor-not-allowed"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-left">Tên đăng nhập</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            className="w-full p-2 mt-1 border rounded-lg text-input"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-left">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="w-full p-2 mt-1 border rounded-lg text-input"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-left">Vai trò</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 mt-1 border rounded-lg text-input"
          >
            <option value="staff">Nhân viên</option>
            <option value="manager">Trưởng nhóm (Manager)</option>
            <option value="admin">Quản trị viên</option>
            <option value="trainee">Thực tập sinh - học việc</option>
          </select>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg" onClick={() => navigate(-1)}>
            Quay lại
          </button>
          <button
            onClick={handleRegister}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterStaff;