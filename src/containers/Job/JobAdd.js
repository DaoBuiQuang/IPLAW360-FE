import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
function JobAdd() {
  const navigate = useNavigate();
  const [maNganhNghe, setMaNganhNghe] = useState("");
  const [tenNganhNghe, setTenNganhNghe] = useState("");
  const [errors, setErrors] = useState({});
  const isFormValid = maNganhNghe.trim() !== "" && tenNganhNghe.trim() !== "";
  const validateField = (field, value) => {
    let error = "";
    if (!value.trim()) {
      if (field === "maNganhNghe") error = "Mã ngành nghề không được để trống";
      if (field === "tenNganhNghe") error = "Tên ngành nghề không được để trống";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };
  const handleAddJob = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/industry/add",
        data: {
          maNganhNghe,
          tenNganhNghe,
        },
      });
  
      await showSuccess("Thành công!", "Thêm ngành nghề thành công!");
      setMaNganhNghe("");
      setTenNganhNghe("");
    } catch (error) {
      console.error("Lỗi khi thêm ngành nghề!", error);
      showError("Thất bại!", "Đã có lỗi xảy ra khi thêm ngành nghề.", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Thêm ngành nghề mới</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-left">Mã ngành nghề <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={maNganhNghe}
              onChange={(e) => {
                setMaNganhNghe(e.target.value)
                validateField("maNganhNghe", e.target.value);
              }}
              placeholder="Nhập mã ngành nghề"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
            {errors.maNganhNghe && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.maNganhNghe}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-left">Tên ngành nghề <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={tenNganhNghe}
              onChange={(e) => {
                setTenNganhNghe(e.target.value)
                validateField("tenNganhNghe", e.target.value);
              }}
              placeholder="Nhập tên ngành nghề"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
            {errors.tenNganhNghe && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.tenNganhNghe}</p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
          <button
            onClick={handleAddJob}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
              }`}
          >
            Thêm ngành nghề
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobAdd;
