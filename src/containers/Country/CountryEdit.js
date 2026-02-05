import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";

function CountryEdit() {
  const navigate = useNavigate();
  const { maQuocGia } = useParams();
  const [tenQuocGia, setTenQuocGia] = useState("");
  const [linkAnhBase64, setLinkAnhBase64] = useState(""); // ảnh hiện tại hoặc mới
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState({});

  const isFormValid =
    maQuocGia.trim() !== "" &&
    tenQuocGia.trim() !== "" &&
    !imageError;

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

  useEffect(() => {
    const fetchCountryDetail = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }
      try {
        const response = await callAPI({
          method: "post",
          endpoint: "/country/detail",
          data: { maQuocGia },
          token: token,
        });

        setTenQuocGia(response.tenQuocGia);
        setLinkAnhBase64(response.linkAnh || ""); // ảnh cũ từ CSDL
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết quốc gia:", error);
        showError("Thất bại!", "Đã xảy ra lỗi.");
      }
    };

    fetchCountryDetail();
  }, [maQuocGia]);

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

  const handleUpdateCountry = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      await callAPI({
        method: "put",
        endpoint: "/country/update",
        data: {
          maQuocGia,
          tenQuocGia,
          linkAnh: linkAnhBase64,
        },
        token: token,
      });

      await showSuccess("Thành công!", "Cập nhật quốc gia thành công!");
      navigate("/countrylist");
    } catch (error) {
      console.error("Lỗi khi cập nhật quốc gia:", error);
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📌 Chỉnh sửa quốc gia
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
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
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
              className={`w-full p-2 mt-1 border rounded-lg text-input focus:outline-none focus:border-blue-500 ${errors.tenQuocGia ? "border-red-500" : ""
                }`}
            />
            {errors.tenQuocGia && (
              <p className="text-red-500 text-xs mt-1 text-left">
                {errors.tenQuocGia}
              </p>
            )}
          </div>
        </div>

        {/* Ảnh quốc gia */}
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

        {/* Nút thao tác */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
          <button
            onClick={handleUpdateCountry}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
              }`}
          >
            Sửa quốc gia
          </button>
        </div>
      </div>
    </div>
  );
}

export default CountryEdit;
