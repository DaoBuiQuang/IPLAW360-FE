import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";

function GroupEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [maNhom, setMaNhom] = useState("");
  const [tenNhom, setTenNhom] = useState("");
  const [moTa, setMoTa] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [errors, setErrors] = useState({});

  const isFormValid = maNhom.trim() !== "" && tenNhom.trim() !== "";

  const validateField = (field, value) => {
    let error = "";
    if (!value.trim()) {
      if (field === "maNhom") error = "Mã nhóm không được để trống";
      if (field === "tenNhom") error = "Tên nhóm không được để trống";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };

  // ✅ Lấy thông tin nhóm theo ID
  const fetchGroupDetail = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/group/detail",
        data: { id },
      });
      setMaNhom(response.maNhom || "");
      setTenNhom(response.tenNhom || "");
      setMoTa(response.moTa || "");
      setGhiChu(response.ghiChu || "");
    } catch (error) {
      console.error("Lỗi khi lấy thông tin nhóm:", error);
      showError("Thất bại!", "Không lấy được thông tin nhóm.");
    }
  };

  useEffect(() => {
    fetchGroupDetail();
  }, [id]);

  // ✅ Gọi API cập nhật nhóm
  const handleUpdateGroup = async () => {
    try {
      await callAPI({
        method: "put",
        endpoint: "/group/update",
        data: {
          id,
          maNhom,
          tenNhom,
          moTa,
          ghiChu,
        },
      });
      await showSuccess("Thành công!", "Cập nhật nhóm thành công!");
      navigate(-1);
    } catch (error) {
      console.error("Lỗi khi cập nhật nhóm:", error);
      showError("Thất bại!", "Đã xảy ra lỗi khi cập nhật nhóm.");
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">✏️ Chỉnh sửa nhóm</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-left">
              Mã nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={maNhom}
              onChange={(e) => {
                setMaNhom(e.target.value);
                validateField("maNhom", e.target.value);
              }}
              placeholder="Nhập mã nhóm"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
            {errors.maNhom && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.maNhom}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-left">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tenNhom}
              onChange={(e) => {
                setTenNhom(e.target.value);
                validateField("tenNhom", e.target.value);
              }}
              placeholder="Nhập tên nhóm"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
            {errors.tenNhom && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.tenNhom}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-left">Mô tả</label>
            <input
              type="text"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Nhập mô tả nhóm"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-left">Ghi chú</label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập ghi chú (nếu có)"
              className="w-full p-2 mt-1 border rounded-lg text-input"
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
            onClick={handleUpdateGroup}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${
              isFormValid
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Cập nhật nhóm
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupEdit;
