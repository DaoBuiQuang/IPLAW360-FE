import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";

function CountryAdd() {
  const navigate = useNavigate();
  const [maQuocGia, setMaQuocGia] = useState("");
  const [tenQuocGia, setTenQuocGia] = useState("");
  const [linkAnhBase64, setLinkAnhBase64] = useState(""); // Ảnh dạng base64
  const [imageError, setImageError] = useState(""); // Lỗi ảnh
  const [errors, setErrors] = useState({});
  const isFormValid =
    maQuocGia.trim() !== "" &&
    tenQuocGia.trim() !== "" &&
    !imageError; // Kiểm tra lỗi ảnh

  const validateField = (field, value) => {
    let error = "";
    if (!value.trim()) {
      if (field === "maQuocGia") error = "Mã quốc gia không được để trống";
      if (field === "tenQuocGia") error = "Tên quốc gia không được để trống";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };

  // Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      setImageError("Dung lượng ảnh không được vượt quá 5MB.");
      setLinkAnhBase64("");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLinkAnhBase64(reader.result);
      setImageError("");
    };
    reader.readAsDataURL(file);
  };

  const handleAddCountry = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/country/add",
        data: {
          maQuocGia,
          tenQuocGia,
          linkAnh: linkAnhBase64, // Gửi ảnh base64
        },
      });
      await showSuccess("Thành công!", "Thêm quốc gia thành công!");
      setMaQuocGia("");
      setTenQuocGia("");
      setLinkAnhBase64("");
      setErrors({});
    } catch (error) {
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
      console.error("Lỗi khi thêm quốc gia!", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📌 Thêm quốc gia mới
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Mã quốc gia */}
          <div>
            <label className="block text-gray-700 text-left">
              Mã quốc gia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={maQuocGia}
              onChange={(e) => {
                setMaQuocGia(e.target.value);
                validateField("maQuocGia", e.target.value);
              }}
              placeholder="Nhập mã quốc gia"
              className={`w-full p-2 mt-1 border rounded-lg ${errors.maQuocGia ? "border-red-500" : ""
                }`}
            />
            {errors.maQuocGia && (
              <p className="text-red-500 text-xs mt-1 text-left">
                {errors.maQuocGia}
              </p>
            )}
          </div>

          {/* Tên quốc gia */}
          <div>
            <label className="block text-gray-700 text-left">
              Tên quốc gia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tenQuocGia}
              onChange={(e) => {
                setTenQuocGia(e.target.value);
                validateField("tenQuocGia", e.target.value);
              }}
              placeholder="Nhập tên quốc gia"
              className={`w-full p-2 mt-1 border rounded-lg ${errors.tenQuocGia ? "border-red-500" : ""
                }`}
            />
            {errors.tenQuocGia && (
              <p className="text-red-500 text-xs mt-1 text-left">
                {errors.tenQuocGia}
              </p>
            )}
          </div>
        </div>

        {/* Chọn ảnh */}
        <div className="mb-4">
          <label className="block text-gray-700 text-left">
            Ảnh quốc gia (tối đa 5MB)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full mt-1"
          />
          {imageError && (
            <p className="text-red-500 text-xs mt-1 text-left">{imageError}</p>
          )}
          {linkAnhBase64 && (
            <img
              src={linkAnhBase64}
              alt="Xem trước"
              className="mt-2 h-32 object-contain border"
            />
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
          <button
            onClick={handleAddCountry}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
              }`}
          >
            Thêm quốc gia
          </button>
        </div>
      </div>
    </div>
  );
}

export default CountryAdd;
