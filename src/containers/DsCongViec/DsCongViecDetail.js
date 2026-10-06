import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import callAPI from "../../utils/api";

function DsCongViecDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = useSelector((state) => state.auth.role);
  const currentMaNhanSu = localStorage.getItem("maNhanSu") || "";

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------------------
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await callAPI({
          method: "post",
          endpoint: "/ds-cong-viec/detail",
          data: { id: Number(id) },
        });
        setItem(res.data);
      } catch {
        navigate("/dscongviec_list");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  // -----------------------------------------------------------------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!item) return null;

  const isAdmin = role === "admin" || role === "ceo";
  const isSys = item.isSystem === true || item.loaiCongViec === "HE_THONG" || (!item.maNhanSu && item.isSystem !== false);
  const isOwner = item.maNhanSu === currentMaNhanSu;
  const canModify = isAdmin || (!isSys && isOwner);

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Chi tiết công việc
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Ma viet tat */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Mã Viết Tắt
            </label>
            <p className="p-2 bg-gray-50 border rounded-lg text-gray-700 font-mono font-semibold text-blue-600">
              {item.maVietTat}
            </p>
          </div>

          {/* Phân loại */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Phân loại
            </label>
            <p className="p-2 bg-gray-50 border rounded-lg text-gray-700 font-medium">
              {isSys ? (
                <span className="text-blue-600">🌐 Hệ thống (Toàn bộ)</span>
              ) : (
                <span className="text-emerald-600">👤 Cá nhân</span>
              )}
            </p>
          </div>

          {/* Nhan su */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Người tạo
            </label>
            <p className="p-2 bg-gray-50 border rounded-lg text-gray-700">
              {item.nhanSu?.hoTen
                ? `${item.nhanSu.hoTen} (${item.maNhanSu})`
                : item.maNhanSu || "Hệ thống"}
            </p>
          </div>

          {/* Mo ta - full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Mô tả công việc
            </label>
            <p className="p-2 bg-gray-50 border rounded-lg text-gray-700 min-h-[60px]">
              {item.moTa}
            </p>
          </div>

          {/* Ngay tao */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Ngày tạo
            </label>
            <p className="p-2 bg-gray-50 border rounded-lg text-gray-700">
              {formatDate(item.createdAt)}
            </p>
          </div>

          {/* Cap nhat */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Cập nhật lần cuối
            </label>
            <p className="p-2 bg-gray-50 border rounded-lg text-gray-700">
              {formatDate(item.updatedAt)}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg"
            onClick={() => navigate("/dscongviec_list")}
          >
            Quay lại
          </button>
          {canModify && (
            <button
              onClick={() => navigate(`/dscongviec_edit/${item.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DsCongViecDetail;
