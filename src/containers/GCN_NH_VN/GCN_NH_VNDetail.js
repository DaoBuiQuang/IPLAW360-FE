import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import GCN_NH_Info from "../../components/commom/GCN_NH_Info";

function GCN_NH_VNDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);

  // Lấy chi tiết GCN
  const fetchDetail = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: `/gcn_nh/detail`,
        data: { id },
      });
      setData(response);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết GCN_NH:", error);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (!data) return <div className="p-4 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
          Thông tin GCN Nhãn hiệu Việt Nam
        </h2>

        {/* Hiển thị thông tin GCN */}
        <GCN_NH_Info data={data} />

        {/* Các nút hành động */}
        <div className="flex justify-center mt-8 gap-4 flex-wrap">
          <button
            className="bg-gray-500 text-white font-medium hover:bg-gray-600 px-6 py-3 rounded-lg shadow transition"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>

          <button
            onClick={() => navigate(`/gcn_nh_vnedit/${id}`)}
            className="bg-[#009999] hover:bg-[#007a7a] text-white font-medium px-6 py-3 rounded-lg shadow transition"
          >
            Sửa thông tin
          </button>
        </div>
      </div>
    </div>
  );
}

export default GCN_NH_VNDetail;
