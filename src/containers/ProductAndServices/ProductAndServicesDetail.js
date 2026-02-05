import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";

function ProductAndServicesDetail() {
  const navigate = useNavigate();
  const { maSPDV } = useParams();
  const [tenSanPhamDichVu, setTenSanPhamDichVu] = useState("");
  const [moTa, setMoTa] = useState("");

  useEffect(() => {
    const fetchProductService = async () => {
      try {
        const response = await callAPI({
          method: "post",
          endpoint: "/productsandservices/detail",
          data: { maSPDV },
        });
        setTenSanPhamDichVu(response.tenSPDV || "");
        setMoTa(response.moTa || "");
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm & dịch vụ!", error);
      }
    };
    fetchProductService();
  }, [maSPDV]);


  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Chi tiết nhóm Sản phẩm & Dịch vụ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
          <label className="block text-gray-700 text-left font-medium">Mã SP/DV<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={maSPDV}
              readOnly
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200 text-gray-700 text-input"
            />
          </div>
          <div>
          <label className="block text-gray-700 text-left font-medium">Tên SP/DV<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={tenSanPhamDichVu}
              onChange={(e) => setTenSanPhamDichVu(e.target.value)}
              disabled
              placeholder="Nhập tên sản phẩm hoặc dịch vụ"
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200 text-input"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-left">Mô tả</label>
            <textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Nhập mô tả chi tiết"
              disabled
              className="w-full p-2 mt-1 border rounded-lg   bg-gray-200"
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
         
        </div>
      </div>
    </div>
  );
}

export default ProductAndServicesDetail;
