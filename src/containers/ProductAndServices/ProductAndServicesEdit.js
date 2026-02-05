import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
function ProductAndServicesEdit() {
  const navigate = useNavigate();
  const { maSPDV } = useParams();
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
  useEffect(() => {
    const fetchProductService = async () => {
      try {
        const response = await callAPI({
          method: "post",
          endpoint: "/productsandservices/detail",
          data: { maSPDV },
        });
        setTenSPDV(response.tenSPDV || "");
        setMoTa(response.moTa || "");
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm & dịch vụ!", error);
      }
    };
    fetchProductService();
  }, [maSPDV]);

  const handleEditProductService = async () => {
    try {
      await callAPI({
        method: "put",
        endpoint: "/productsandservices/edit",
        data: {
          maSPDV,
          tenSPDV: tenSPDV,
          moTa,
        },
      });
      await showSuccess("Thành công!", "Cập nhật sản phầm dịch vụ thành công!");
      navigate(-1);
    } catch (error) {
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
      console.error("Lỗi khi cập nhật sản phẩm & dịch vụ!", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">✏️ Chỉnh sửa Sản phẩm & Dịch vụ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-left font-medium">Mã SP/DV<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={maSPDV}
              readOnly
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200 text-gray-700 text-input"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left font-medium">Tên SP/DV<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={tenSPDV}
              onChange={(e) => {
                setTenSPDV(e.target.value)
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
            <label className="block text-gray-700 text-left">Mô tả</label>
            <textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Nhập mô tả chi tiết"
              className="w-full p-2 mt-1 border rounded-lg h-24"
            ></textarea>
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
            onClick={handleEditProductService}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
              }`}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductAndServicesEdit;
