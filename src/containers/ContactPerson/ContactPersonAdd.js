import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";

function ContactPersonAdd() {
  const navigate = useNavigate();

  const [tenNguoiLienHe, setTenNguoiLienHe] = useState("");
  const [sdt, setSdt] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [errors, setErrors] = useState({});

  const isFormValid = tenNguoiLienHe.trim() !== "";

  const validateField = (field, value) => {
    let error = "";
    if (field === "tenNguoiLienHe" && !value.trim()) {
      error = "Tên người liên hệ không được để trống";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleAddContact = async () => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/contacts/create",
        data: {
          tenNguoiLienHe,
          sdt,
          diaChi,
          ghiChu,
        },
      });
      await showSuccess("Thành công!", "Thêm người liên hệ thành công!");
      // Reset form hoặc quay lại
      setTenNguoiLienHe("");
      setSdt("");
      setDiaChi("");
      setGhiChu("");
      // navigate(-1); // nếu muốn quay lại danh sách sau khi thêm, bỏ comment dòng này
    } catch (error) {
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
      console.error("Lỗi khi thêm người liên hệ!", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📇 Thêm người liên hệ</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-1 col-span-2">
            <label className="block text-gray-700 text-left">
              Tên người liên hệ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tenNguoiLienHe}
              onChange={(e) => {
                setTenNguoiLienHe(e.target.value);
                validateField("tenNguoiLienHe", e.target.value);
              }}
              placeholder="Nhập tên người liên hệ"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
            {errors.tenNguoiLienHe && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.tenNguoiLienHe}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-left">Số điện thoại</label>
            <input
              type="text"
              value={sdt}
              onChange={(e) => setSdt(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-left">Địa chỉ</label>
            <input
              type="text"
              value={diaChi}
              onChange={(e) => setDiaChi(e.target.value)}
              placeholder="Nhập địa chỉ"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 text-left">Ghi chú</label>
            <textarea
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập ghi chú (nếu có)"
              className="w-full p-2 mt-1 border rounded-lg h-24"
            />
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
            onClick={handleAddContact}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${
              isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Thêm người liên hệ
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactPersonAdd;
