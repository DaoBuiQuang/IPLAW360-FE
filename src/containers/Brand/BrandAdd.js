import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
function BrandAdd() {
  const navigate = useNavigate();
  const [maNhanHieu, setMaNhanHieu] = useState("");
  const [tenNhanHieu, setTenNhanHieu] = useState("");
  const [moTa, setMoTa] = useState("");
  const [linkAnh, setLinkAnh] = useState(""); // ảnh base64
  const [preview, setPreview] = useState(null); // xem trước ảnh

  const [errors, setErrors] = useState({});
  const isFormValid = maNhanHieu.trim() !== "" && tenNhanHieu.trim() !== "";
  const validateField = (field, value) => {
    let error = "";
    if (!value.trim()) {
      if (field === "maNhanHieu") error = "Mã nhãn hiệu không được để trống";
      if (field === "tenNhanHieu") error = "Tên nhãn hiệu không được để trống";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLinkAnh(reader.result); // Base64
      setPreview(reader.result); // Xem trước ảnh
    };
    reader.readAsDataURL(file);
  };

  const handleAddBrand = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/brand/add",
        data: {
          maNhanHieu,
          tenNhanHieu,
          moTa,
          linkAnh,
        },
      });
      await showSuccess("Thành công!", "Thêm nhãn hiệu thành công!");
      setMaNhanHieu("");
      setTenNhanHieu("");
      setMoTa("");
      setLinkAnh("");
      setPreview(null);
    } catch (error) {
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
      console.error("Lỗi khi thêm nhãn hiệu!", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Thêm nhãn hiệu mới</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-left">Mã nhãn hiệu <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={maNhanHieu}
              onChange={(e) => {
                setMaNhanHieu(e.target.value)
                validateField("maNhanHieu", e.target.value);
              }}
              placeholder="Nhập mã nhãn hiệu"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
            {errors.maNhanHieu && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.maNhanHieu}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-left">Tên nhãn hiệu <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={tenNhanHieu}
              onChange={(e) => {
                setTenNhanHieu(e.target.value)
                validateField("tenNhanHieu", e.target.value);
              }}
              placeholder="Nhập tên nhãn hiệu"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
            {errors.tenNhanHieu && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.tenNhanHieu}</p>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-left">Mô tả</label>
            <textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Nhập mô tả nhãn hiệu"
              className="w-full p-2 mt-1 border rounded-lg  h-24"
            ></textarea>
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-left">Chọn ảnh</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 mt-1 border rounded-lg"
            />
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="Ảnh xem trước" className="h-32 object-contain rounded-lg border" />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
          <button
            onClick={handleAddBrand}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
              }`}
          >
            Thêm nhãn hiệu
          </button>
        </div>
      </div>
    </div>
  );
}

export default BrandAdd;
