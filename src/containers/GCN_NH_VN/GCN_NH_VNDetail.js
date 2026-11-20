import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { Modal, DatePicker, Radio, Input } from "antd";
import callAPI from "../../utils/api";
import GCN_NH_Info from "../../components/commom/GCN_NH_Info";
import { showSuccess, showError } from "../../components/commom/Notification";

function GCN_NH_VNDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [quickApproveModalOpen, setQuickApproveModalOpen] = useState(false);
  const [selectedPendingItem, setSelectedPendingItem] = useState(null);
  const [quickApproveStatus, setQuickApproveStatus] = useState(1);
  const [quickApproveDate, setQuickApproveDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [quickRejectDate, setQuickRejectDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [quickRejectReason, setQuickRejectReason] = useState("");
  const [submittingQuickApprove, setSubmittingQuickApprove] = useState(false);

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

  const openQuickApproveModal = (bd) => {
    setSelectedPendingItem(bd);
    setQuickApproveStatus(1);
    setQuickApproveDate(dayjs().format("YYYY-MM-DD"));
    setQuickRejectDate(dayjs().format("YYYY-MM-DD"));
    setQuickRejectReason("");
    setQuickApproveModalOpen(true);
  };

  const handleConfirmQuickApprove = async () => {
    if (!selectedPendingItem?.id) return;
    setSubmittingQuickApprove(true);
    try {
      const isSuaDoi = selectedPendingItem.loaiBienDong === "SUA_DOI";
      const endpoint = isSuaDoi ? "/application_sd_gcn_nh_vn/update" : "/gcn_cq_nh_vn/update";
      const res = await callAPI({
        method: "post",
        endpoint,
        data: {
          id: selectedPendingItem.id,
          trangThaiDuyet: Number(quickApproveStatus),
          duocGhiNhanSuaDoi: Number(quickApproveStatus) === 1,
          ngayChapThuan: Number(quickApproveStatus) === 1 ? quickApproveDate : null,
          ngayGhiNhanSuaDoi: Number(quickApproveStatus) === 1 ? quickApproveDate : null,
          ngayGhiNhanCQ: Number(quickApproveStatus) === 1 ? quickApproveDate : null,
          ngayTuChoi: Number(quickApproveStatus) === 2 ? quickRejectDate : null,
          lyDoTuChoi: Number(quickApproveStatus) === 2 ? quickRejectReason : null,
        },
      });
      await showSuccess("Thành công", "Đã cập nhật kết quả xét duyệt văn bằng của Cục SHTT!");
      setQuickApproveModalOpen(false);
      if (Number(quickApproveStatus) === 1 && res?.idGCN_NH_Moi) {
        navigate(`/gcn_nhdetail/${res.idGCN_NH_Moi}`);
        window.location.reload();
      } else {
        fetchDetail();
      }
    } catch (error) {
      console.error("Lỗi khi xét duyệt nhanh GCN:", error);
      showError("Thất bại", "Không thể cập nhật kết quả xét duyệt.", error);
    } finally {
      setSubmittingQuickApprove(false);
    }
  };

  if (!data) return <div className="p-4 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
          Thông tin GCN Nhãn hiệu Việt Nam
        </h2>

        {/* Banner văn bằng đã đóng băng */}
        {Number(data.bangGoc) === 1 && (
          <div className="mb-6 p-4 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-left">
            <div className="font-semibold text-base text-gray-800">
              🔒 Giấy chứng nhận này đã đóng băng (Lưu lịch sử)
            </div>
            <p className="text-sm mt-1">
              Văn bằng này đã được Cục chấp thuận sửa đổi / chuyển nhượng và toàn bộ hiệu lực được kế thừa sang văn bằng mới.
            </p>
            {Array.isArray(data.dsGCNCon) && data.dsGCNCon.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {data.dsGCNCon.map((con, idx) => (
                  <button
                    key={con.id || idx}
                    type="button"
                    onClick={() => {
                      navigate(`/gcn_nhdetail/${con.id}`);
                      window.location.reload();
                    }}
                    className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    ➔ Xem GCN kế thừa: {con.soBang || `#${con.id}`} ({con.loaiBienDong})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Banner có tờ khai Đang sửa đổi / Đang chuyển quyền chờ Cục xét duyệt */}
        {Array.isArray(data.dsBienDongChoDuyet) && data.dsBienDongChoDuyet.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-left space-y-2">
            <div className="font-semibold text-base">
              ⏳ Giấy chứng nhận đang có Tờ khai sửa đổi / chuyển nhượng chờ Cục SHTT xét duyệt:
            </div>
            {data.dsBienDongChoDuyet.map((bd, idx) => (
              <div
                key={bd.id || idx}
                className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-3 rounded border border-amber-200 gap-2"
              >
                <div className="text-sm">
                  <span className="font-semibold text-amber-800">[{bd.tenBienDong}]</span>{" "}
                  Số tờ khai: <b>{bd.soDon || "—"}</b> | Ngày nộp YC:{" "}
                  <b>{bd.ngayYeuCau ? new Date(bd.ngayYeuCau).toLocaleDateString("vi-VN") : "—"}</b> | Lần:{" "}
                  <b>{bd.lanBienDong || 1}</b>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openQuickApproveModal(bd)}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    ⚖️ Xét duyệt (Chấp thuận / Từ chối)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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

          {Number(data.bangGoc) !== 1 && (
            <button
              onClick={() => navigate(`/gcn_nh_vnedit/${id}`)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white font-medium px-6 py-3 rounded-lg shadow transition"
            >
              Sửa thông tin
            </button>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <button
              type="button"
              onClick={() => navigate(`/gcn_cq_nh_vn_add/${id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <span>Chuyển quyền sở hữu</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/gcn_gh_nh_vn_add/${id}`)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <span>Thêm mới đơn gia hạn</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/gcn_sd_nh_vn_add/${id}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <span>Thêm mới đơn sửa đổi</span>
            </button>
          </div>
        </div>

        <Modal
          title="⚖️ Cập nhật kết quả xét duyệt của Cục SHTT"
          open={quickApproveModalOpen}
          onOk={handleConfirmQuickApprove}
          onCancel={() => setQuickApproveModalOpen(false)}
          confirmLoading={submittingQuickApprove}
          okText="Xác nhận lưu"
          cancelText="Hủy"
          width={620}
        >
          {selectedPendingItem && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded border text-sm">
                <div>
                  Loại tờ khai: <b>{selectedPendingItem.tenBienDong}</b>
                </div>
                <div>
                  Số tờ khai: <b>{selectedPendingItem.soDon || "—"}</b>
                </div>
              </div>
              <Radio.Group
                value={Number(quickApproveStatus)}
                onChange={(e) => setQuickApproveStatus(Number(e.target.value))}
                className="flex flex-col gap-2"
              >
                <Radio value={1}>
                  ✅ Được chấp thuận
                </Radio>
                <Radio value={2}>
                  ❌ Từ chối
                </Radio>
              </Radio.Group>

              {Number(quickApproveStatus) === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày ghi nhận
                  </label>
                  <DatePicker
                    value={quickApproveDate ? dayjs(quickApproveDate) : null}
                    onChange={(d) => setQuickApproveDate(d ? d.format("YYYY-MM-DD") : null)}
                    format="DD/MM/YYYY"
                    className="w-full"
                  />
                </div>
              )}

              {Number(quickApproveStatus) === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày từ chối
                    </label>
                    <DatePicker
                      value={quickRejectDate ? dayjs(quickRejectDate) : null}
                      onChange={(d) => setQuickRejectDate(d ? d.format("YYYY-MM-DD") : null)}
                      format="DD/MM/YYYY"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lý do từ chối
                    </label>
                    <Input
                      value={quickRejectReason}
                      onChange={(e) => setQuickRejectReason(e.target.value)}
                      placeholder="Nhập lý do từ chối"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default GCN_NH_VNDetail;
