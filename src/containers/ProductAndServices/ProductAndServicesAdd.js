import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
function ProductAndServicesAdd() {
  const navigate = useNavigate();
  const [maSPDV, setMaSPDV] = useState("");
  const [tenSPDV, setTenSPDV] = useState("");
  const [moTa, setMoTa] = useState("");

  const [errors, setErrors] = useState({});
    const isFormValid = maSPDV.trim() !== "" && tenSPDV.trim() !== "";
    const validateField = (field, value) => {
      let error = "";
      if (!value.trim()) {
        if (field === "maSPDV") error = "Mã sản phẩm dịch vụ không được để trống";
        if (field === "tenSPDV") error = "Tên sản phẩm dịch vụ không được để trống";
      }
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: error,
      }));
    };
  const handleAddProduct = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/productsandservices/add", 
        data: {
          maSPDV,
          tenSPDV,
          moTa,
        },
      });
      await showSuccess("Thành công!", "Thêm sản phầm dịch vụ thành công!");
      setMaSPDV("");
      setTenSPDV("");
      setMoTa("");
    } catch (error) {
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Thêm sản phẩm / dịch vụ mới</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-left font-medium">Mã SP/DV<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={maSPDV}
              onChange={(e) => {setMaSPDV(e.target.value)
                validateField("maSPDV", e.target.value);
              }}
              placeholder="Nhập mã sản phẩm / dịch vụ"
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-input"
            />
            {errors.maSPDV && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.maSPDV}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-left font-medium">Tên SP/DV<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={tenSPDV}
              onChange={(e) => {setTenSPDV(e.target.value)
                validateField("tenSPDV", e.target.value);
              }}
              placeholder="Nhập tên sản phẩm / dịch vụ"
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-input"
            />
             {errors.tenSPDV && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.tenSPDV}</p>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-left font-medium">Mô tả</label>
            <textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Nhập mô tả sản phẩm / dịch vụ"
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg h-28 resize-none focus:outline-none focus:ring focus:ring-blue-300"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
          >
            Quay lại
          </button>
          <button
            onClick={handleAddProduct}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
              }`}
          >
            Thêm mới
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductAndServicesAdd;
