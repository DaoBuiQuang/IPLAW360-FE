import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";

function ContactPersonEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tenNguoiLienHe, setTenNguoiLienHe] = useState("");
  const [sdt, setSdt] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [errors, setErrors] = useState({});

  const isFormValid = (id || "").toString().trim() !== "" && tenNguoiLienHe.trim() !== "";

  const validateField = (field, value) => {
    let error = "";
    if (field === "tenNguoiLienHe" && !value.trim()) {
      error = "Tên người liên hệ không được để trống";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await callAPI({
          method: "post",
          endpoint: "/contacts/detail",
          data: { id },
        });
        setTenNguoiLienHe(response.tenNguoiLienHe || "");
        setSdt(response.sdt || "");
        setDiaChi(response.diaChi || "");
        setGhiChu(response.ghiChu || "");
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người liên hệ!", error);
        showError("Thất bại!", "Không tải được thông tin người liên hệ.", error);
      }
    };
    fetchContact();
  }, [id]);

  const handleEditContact = async () => {
    try {
      await callAPI({
        method: "post", // backend router dùng POST /contacts/update theo controller đã gửi
        endpoint: "/contacts/update",
        data: {
          id,
          tenNguoiLienHe,
          sdt,
          diaChi,
          ghiChu,
        },
      });
      await showSuccess("Thành công!", "Cập nhật người liên hệ thành công!");
      navigate(-1);
    } catch (error) {
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
      console.error("Lỗi khi cập nhật người liên hệ!", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">✏️ Chỉnh sửa người liên hệ</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-left">
              ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={id}
              readOnly
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-100"
            />
          </div>

          <div>
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
            onClick={handleEditContact}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${
              isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactPersonEdit;
