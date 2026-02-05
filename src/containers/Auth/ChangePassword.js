import React, { useState } from "react";
import callAPI from "../../utils/api";
import {
  Eye,
  EyeOff
} from "lucide-react"; 
import { showSuccess, showError } from "../../components/commom/Notification";
const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    let error = "";
    if (!value.trim()) {
      if (field === "oldPassword") error = "Mật khẩu cũ không được để trống";
      if (field === "newPassword") error = "Mật khẩu mới không được để trống";
      if (field === "confirmNewPassword") error = "Mật khẩu xác nhận không được để trống";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/changepassword",
        data: { oldPassword, newPassword },
      });
        await showSuccess("Thành công!", "Đổi mật khẩu thành công!");
      setMessage(response.message || "Đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
        showError("Thất bại!", "Đã xảy ra lỗi.", error);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu.");
    }
  };

  // 👉 Hàm render input + icon
  const renderPasswordInput = (
    label,
    value,
    onChange,
    showPassword,
    toggleShowPassword,
    fieldName,
    error
  ) => (
    <div>
      <label className="block text-gray-700 text-left">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            validateField(fieldName, e.target.value);
          }}
          placeholder={label}
          className="w-full p-2 mt-1 border rounded-lg text-input pr-10"
        />
        <div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
          onClick={toggleShowPassword}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 text-left">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>

      {message && <div className="text-green-600 mb-3">{message}</div>}
      {error && <div className="text-red-600 mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderPasswordInput(
          "Mật khẩu hiện tại",
          oldPassword,
          setOldPassword,
          showOldPassword,
          () => setShowOldPassword(!showOldPassword),
          "oldPassword",
          errors.oldPassword
        )}

        {renderPasswordInput(
          "Mật khẩu mới",
          newPassword,
          setNewPassword,
          showNewPassword,
          () => setShowNewPassword(!showNewPassword),
          "newPassword",
          errors.newPassword
        )}

        {renderPasswordInput(
          "Xác nhận mật khẩu mới",
          confirmNewPassword,
          setConfirmNewPassword,
          showConfirmPassword,
          () => setShowConfirmPassword(!showConfirmPassword),
          "confirmNewPassword",
          errors.confirmNewPassword
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
